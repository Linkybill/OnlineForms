"use strict";

const gulp = require("gulp");
const build = require("@microsoft/sp-build-web");
const fs = require("fs");
const JSZip = require("jszip");

console.log("==== Pipeline Environment Debug ====");
console.log("sharePointCredentialsUsername:", process.env.sharePointCredentialsUsername || "<not set>");
console.log("sharePointCredentialsPassword:", process.env.sharePointCredentialsPassword ? "***" : "<not set>");
console.log("sharePointCredentialsDomain:", process.env.sharePointCredentialsDomain || "<not set>");
console.log("===================================");

let gulpSettings = {};
const settingsPath = "../gulp-settings.json";
if (fs.existsSync(settingsPath)) {
  gulpSettings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
}
const packageSolutionSettings = require("./config/package-solution.json");
const copyAssetsSettings = require("./config/copy-assets.json");
const jsonEditor = require("gulp-json-editor");
const packageJson = require("./package.json");
const exec = require("child_process").exec; // Hier wird exec importiert

build.addSuppression(/Warning - \[sass\] The local CSS class .* is not camelCase and will not be type-safe./gi);

// force use of projects specified typescript version
const typeScriptConfig = require("@microsoft/gulp-core-build-typescript/lib/TypeScriptConfiguration");
typeScriptConfig.TypeScriptConfiguration.setTypescriptCompiler(require("typescript"));

function loadSecurity(gulpDeploymentEnv) {
  if (process.env["sharePointCredentialsUsername"] && process.env["sharePointCredentialsPassword"] && process.env["sharePointCredentialsDomain"]) {
    return {
      sharePointCredentials: {
        domain: process.env["sharePointCredentialsDomain"],
        username: process.env["sharePointCredentialsUsername"],
        password: process.env["sharePointCredentialsPassword"]
      }
    };
  }
  var credFile = require("../" + gulpDeploymentEnv.Settings.credentialsFile);

  return credFile;
}
// force use of projects specified react version
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    console.log("externals1: " + generatedConfiguration.externals);

    generatedConfiguration.externals = generatedConfiguration.externals.filter((name) => !["react", "react-dom"].includes(name));

    console.log("externals2: " + generatedConfiguration.externals);
    if (build.getConfig().production) {
      var basePath = build.writeManifests.taskConfig.cdnBasePath;
      if (!basePath.endsWith("/")) {
        basePath += "/";
      }
      generatedConfiguration.output.publicPath = basePath;
    } else {
      generatedConfiguration.output.publicPath = "/dist/";
    }
    const TerserPlugin = require("terser-webpack-plugin-legacy");
    generatedConfiguration.plugins.forEach((plugin, i) => {
      if (plugin.options && plugin.options.mangle === true) {
        console.log("removing plugin");
        console.log(plugin);
        generatedConfiguration.plugins[i] = new TerserPlugin({
          test: /\.(js|vue)(\?.*)?$/i
        });
      }
    });

    return generatedConfiguration;
  }
});

gulp.task("init", function () {
  return new Promise((resolve, reject) => {
    const localPackageJsonFilePath = "./package.json";
    const globalPackageJsonFilePath = "../package.json";
    if (fs.existsSync(localPackageJsonFilePath) && fs.existsSync(globalPackageJsonFilePath)) {
      var localPackageSettings = JSON.parse(fs.readFileSync(localPackageJsonFilePath).toString());
      var globalPackageSettings = JSON.parse(fs.readFileSync(globalPackageJsonFilePath).toString());

      for (var key in globalPackageSettings) {
        if (globalPackageSettings.hasOwnProperty(key)) {
          localPackageSettings.scripts[key] = globalPackageSettings[key];
        }
      }
      fs.writeFileSync(localPackageJsonFilePath, JSON.stringify(localPackageSettings));
    }

    console.log('Executing "npm run init" command...');
    var child = require("child_process").exec("npm run init");
    child.stdout.pipe(process.stdout);
    return child.on("exit", function () {
      console.log('Executing "spfx-fast-serve" command...');
      var child = require("child_process").exec("spfx-fast-serve");
      child.stdout.pipe(process.stdout);
      return child.on("exit", function () {
        console.log('Executing "npm install" command...');
        var child = require("child_process").exec("npm install");
        child.stdout.pipe(process.stdout);
        return child.on("exit", function () {
          if (fs.existsSync("../.gitignore")) {
            var gitIgnoreFileContent = fs.readFileSync("../.gitignore").toString();
            fs.writeFileSync("./.gitignore", gitIgnoreFileContent);
          }
          if (fs.existsSync("../settings.json")) {
            var vsCodeSettings = fs.readFileSync("../settings.json").toString();
            fs.writeFileSync("./.vscode/settings.json", vsCodeSettings);
          }
          if (fs.existsSync("../.prettierrc.js")) {
            var prettierSettings = fs.readFileSync("../.prettierrc.js").toString();
            fs.writeFileSync("./.prettierrc.js", prettierSettings);
          }
          resolve();
        });
      });
    });
  });
});

/**
 * sync-version:
 * - liest aktuell deployte Version aus dem im AppCatalog deployten .sppkg (über ProductId)
 * - bump: letztes Segment +1
 * - schreibt NUR s
 */
function _combineServerRelativeUrl(a, b) {
  if (!a) a = "";
  if (!b) b = "";
  if (!a.endsWith("/")) a += "/";
  return a + b.replace(/^\//, "");
}

gulp.task("sync-version", function () {
  return new Promise(async (resolve, reject) => {
    try {
      const gulpDeploymentEnv = require("./gulp-deployment-env.json");
      const security = loadSecurity(gulpDeploymentEnv);

      const sprequest = require("sp-request");
      const spr = sprequest.create({
        username: security.sharePointCredentials.username,
        password: security.sharePointCredentials.password,
        domain: security.sharePointCredentials.domain
      });

      const siteUrl = gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl;

      // Dateiname aus package-solution.json nur zum Download bestimmen
      const pkg = require("./config/package-solution.json");
      const sppkgFileName = pkg.paths.zippedPackage.split("/").pop();

      // SP2019 SE: AppCatalog Library unter /AppCatalog (wie bei dir im Screenshot)
      const appCatalogLibraryServerRelativeUrl = "/sites/appkatalog/AppCatalog";
      const fileServerRelativeUrl = _combineServerRelativeUrl(appCatalogLibraryServerRelativeUrl, sppkgFileName);

      const fileUrl = siteUrl + "/_api/web/GetFileByServerRelativeUrl('" + encodeURIComponent(fileServerRelativeUrl) + "')/$value";

      console.log("sync-version:");
      console.log("  siteUrl    :", siteUrl);
      console.log("  sppkg      :", sppkgFileName);
      console.log("  fileRelUrl :", fileServerRelativeUrl);
      console.log("  GET        :", fileUrl);

      // sppkg als Buffer laden
      const fileRes = await spr.get(fileUrl, {
        responseType: "buffer",
        headers: { Accept: "application/octet-stream" }
      });

      const buffer = fileRes.body;

      // ZIP öffnen
      const zip = await JSZip.loadAsync(buffer);

      // AppManifest.xml lesen
      const appManifestPath = Object.keys(zip.files).find((p) => p.toLowerCase() === "appmanifest.xml");
      if (!appManifestPath) {
        throw new Error("AppManifest.xml nicht im sppkg gefunden.");
      }

      const appManifestXml = await zip.files[appManifestPath].async("string");

      // NUR Version am <App ... Version="x.y.z.w"> ziehen (nicht XML header version="1.0")
      const appTagMatch = appManifestXml.match(/<App\b[^>]*\bVersion="([\d\.]+)"/);
      if (!appTagMatch) {
        throw new Error('Keine App-Version im <App ... Version="..."> gefunden.');
      }

      const deployedVersion = appTagMatch[1]; // z.B. 8.0.170.0
      const parts = deployedVersion.split(".").map((x) => parseInt(x, 10));
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
        throw new Error("Ungültige App-Version in AppManifest.xml: " + deployedVersion);
      }

      // Regel: 8.0.170.0 -> 8.0.171.0 (BUILD +1, REVISION = 0)
      parts[2] = parts[2] + 1;
      parts[3] = 0;
      const nextVersion = parts.join(".");

      console.log("  deployed   :", deployedVersion);
      console.log("  next       :", nextVersion);

      // WIE FRÜHER: NUR package-solution.json anpassen
      gulp
        .src("./config/package-solution.json")
        .pipe(
          jsonEditor(function (json) {
            json.solution.version = nextVersion;
            return json;
          })
        )
        .pipe(gulp.dest("./config"))
        .on("finish", resolve)
        .on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
});

gulp.task("schedule-deployment", function () {
  return new Promise((resolve, reject) => {
    try {
      const gulpDeploymentEnv = require("./gulp-deployment-env.json");
      const pkgFile = require("./config/package-solution.json");
      const solutionFile = pkgFile.paths.zippedPackage;
      const fileLocation = `./sharepoint/${solutionFile}`;
      gulpDeploymentEnv["appPackage"] = solutionFile.split("/").pop();
      fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(gulpDeploymentEnv));
      const fileNameNoExt = solutionFile
        .split("/")
        .pop()
        .replace(/\.[^/.]+$/, "");
      var path = gulpDeploymentEnv.path + "\\" + fileNameNoExt + "\\" + gulpDeploymentEnv.date;
      var assetsFolder = `${path}\\${gulpDeploymentEnv.sharePointAppCatalogClientSideAssetsLibrary}\\${packageSolutionSettings.solution.id}`;
      if (!fs.existsSync(assetsFolder)) {
        fs.mkdirSync(assetsFolder, { recursive: true });
      }
      new Promise((resolveAppPkg, rejectAppPkg) => {
        return gulp.src(`${copyAssetsSettings.deployCdnPath}/*.+(js|jpg|jpeg|gif|png|svg)`).pipe(gulp.dest(assetsFolder)).on("finish", resolveAppPkg);
      }).then(function () {
        console.log("Successfully copied assets to: " + assetsFolder);
        return gulp
          .src([fileLocation, "./gulp-deployment-env.json"])
          .pipe(gulp.dest(path))
          .on("finish", function () {
            console.log("Successfully copied app package and deployment settings file to: " + path);
            resolve();
          });
      });
    } catch (error) {
      reject();
    }
  });
});

gulp.task("select-deployment-env-date", function () {
  const readlineSync = require("readline-sync");

  var mandantChoices = [];
  for (const i in gulpSettings.Mandanten) {
    mandantChoices.push(gulpSettings.Mandanten[i].Name);
  }

  if (fs.existsSync("./gulp-deployment-env.json")) {
    const currentDeploymentEnv = require("./gulp-deployment-env.json");
    var deploymentDate = "";
    if (readlineSync.keyInYN("Deploy to: " + currentDeploymentEnv.Settings.sharePointAppCatalogSiteUrl + "?")) {
      deploymentDate = readlineSync.question("Enter deployment date (YYYY-MM-dd): ");
      if (!deploymentDate || deploymentDate == "") {
        throw new Error("No deployment date specified. Deployment aborted!");
      }
      currentDeploymentEnv["date"] = deploymentDate;
      fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(currentDeploymentEnv));
      console.log("Scheduling deployment...");
    } else {
      var mandantIndex = readlineSync.keyInSelect(mandantChoices, "Select the deployment mandant:");
      if (mandantChoices[mandantIndex] && gulpSettings.Mandanten[mandantIndex]) {
        var envChoices = [];
        for (const j in gulpSettings.Mandanten[mandantIndex].Environments) {
          envChoices.push(gulpSettings.Mandanten[mandantIndex].Environments[j].Name);
        }
        var envIndex = readlineSync.keyInSelect(envChoices, "Select the deployment environment for mandant: " + gulpSettings.Mandanten[mandantIndex].Name);
        if (envChoices[envIndex] && gulpSettings.Mandanten[mandantIndex].Environments[envIndex]) {
          deploymentDate = readlineSync.question("Enter deployment date (YYYY-MM-dd): ");
          if (!deploymentDate || deploymentDate == "") {
            throw new Error("No deployment date specified. Deployment aborted!");
          }
          gulpSettings.Mandanten[mandantIndex].Environments[envIndex].Settings["date"] = deploymentDate;
          fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
        } else {
          throw new Error("Deployment aborted!");
        }
      } else {
        throw new Error("Deployment aborted!");
      }
    }
  } else {
    var mandantIndex = readlineSync.keyInSelect(mandantChoices, "Select the deployment mandant:");
    if (mandantChoices[mandantIndex] && gulpSettings.Mandanten[mandantIndex]) {
      var envChoices = [];
      for (const j in gulpSettings.Mandanten[mandantIndex].Environments) {
        envChoices.push(gulpSettings.Mandanten[mandantIndex].Environments[j].Name);
      }
      var envIndex = readlineSync.keyInSelect(envChoices, "Select the deployment environment for mandant: " + gulpSettings.Mandanten[mandantIndex].Name);
      if (envChoices[envIndex] && gulpSettings.Mandanten[mandantIndex].Environments[envIndex]) {
        var deploymentDate = readlineSync.question("Enter deployment date (YYYY-MM-dd): ");
        if (!deploymentDate || deploymentDate == "") {
          throw new Error("No deployment date specified. Deployment aborted!");
        }
        gulpSettings.Mandanten[mandantIndex].Environments[envIndex].Settings["date"] = deploymentDate;
        fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
      } else {
        throw new Error("Deployment aborted!");
      }
    } else {
      throw new Error("Deployment aborted!");
    }
  }
});

gulp.task("select-deployment-env", function () {
  const readlineSync = require("readline-sync");

  var mandantChoices = [];
  for (const i in gulpSettings.Mandanten) {
    mandantChoices.push(gulpSettings.Mandanten[i].Name);
  }

  if (fs.existsSync("./gulp-deployment-env.json")) {
    const currentDeploymentEnv = JSON.parse(fs.readFileSync("./gulp-deployment-env.json"));
    if (readlineSync.keyInYN("Deploy to: " + currentDeploymentEnv.Settings.sharePointAppCatalogSiteUrl + "?")) {
      console.log("Processing with deployment...");
    } else {
      var mandantIndex = readlineSync.keyInSelect(mandantChoices, "Select the deployment mandant:");
      if (mandantChoices[mandantIndex] && gulpSettings.Mandanten[mandantIndex]) {
        var envChoices = [];
        for (const j in gulpSettings.Mandanten[mandantIndex].Environments) {
          envChoices.push(gulpSettings.Mandanten[mandantIndex].Environments[j].Name);
        }
        var envIndex = readlineSync.keyInSelect(envChoices, "Select the deployment environment for mandant: " + gulpSettings.Mandanten[mandantIndex].Name);
        if (envChoices[envIndex] && gulpSettings.Mandanten[mandantIndex].Environments[envIndex]) {
          console.log("Mandant ausgwählt " + JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
          fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
        } else {
          throw new Error("Deployment aborted!");
        }
      } else {
        throw new Error("Deployment aborted!");
      }
    }
  } else {
    var mandantIndex = readlineSync.keyInSelect(mandantChoices, "Select the deployment mandant:");
    if (mandantChoices[mandantIndex] && gulpSettings.Mandanten[mandantIndex]) {
      var envChoices = [];
      for (const j in gulpSettings.Mandanten[mandantIndex].Environments) {
        envChoices.push(gulpSettings.Mandanten[mandantIndex].Environments[j].Name);
      }
      var envIndex = readlineSync.keyInSelect(envChoices, "Select the deployment environment for mandant: " + gulpSettings.Mandanten[mandantIndex].Name);
      if (envChoices[envIndex] && gulpSettings.Mandanten[mandantIndex].Environments[envIndex]) {
        console.log("writing guld deployment enf " + JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
        fs.writeFileSync("./gulp-deployment-env.json", JSON.stringify(gulpSettings.Mandanten[mandantIndex].Environments[envIndex]));
      } else {
        throw new Error("Deployment aborted!");
      }
    } else {
      throw new Error("Deployment aborted!");
    }
  }
});

gulp.task("delete-assets", function () {
  const gulpDeploymentEnv = require("./gulp-deployment-env.json");
  const gulpSettingsSecurity = loadSecurity(gulpDeploymentEnv);
  const context = {
    siteUrl: gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl,
    creds: {
      username: gulpSettingsSecurity.sharePointCredentials.username,
      password: gulpSettingsSecurity.sharePointCredentials.password,
      domain: gulpSettingsSecurity.sharePointCredentials.domain
    }
  };
  const options = {
    folder: `${gulpDeploymentEnv.Settings.sharePointAppCatalogClientSideAssetsLibrary}/${packageSolutionSettings.solution.id}`,
    fileRegExp: new RegExp(".*..*.js", "i")
  };
  if (gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl.indexOf(".sharepoint.com") >= 0) {
    process.env.https_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
    process.env.http_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
  }
  const sppurge = require("sppurge").default;
  return sppurge(context, options);
});
gulp.task("upload-assets", function () {
  const gulpDeploymentEnv = require("./gulp-deployment-env.json");
  const gulpSettingsSecurity = loadSecurity(gulpDeploymentEnv);
  const coreOptions = {
    siteUrl: gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl,
    folder: `${gulpDeploymentEnv.Settings.sharePointAppCatalogClientSideAssetsLibrary}/${packageSolutionSettings.solution.id}`
  };
  console.log(gulpSettingsSecurity);
  const creds = {
    username: gulpSettingsSecurity.sharePointCredentials.username,
    password: gulpSettingsSecurity.sharePointCredentials.password,
    domain: gulpSettingsSecurity.sharePointCredentials.domain
  };

  if (gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl.indexOf(".sharepoint.com") >= 0) {
    process.env.https_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
    process.env.http_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
  }
  const spsave = require("gulp-spsave");
  return gulp.src(`${copyAssetsSettings.deployCdnPath}/*.+(js|jpg|jpeg|gif|png|svg)`).pipe(spsave(coreOptions, creds));
});

gulp.task("update-write-manifests", function () {
  const gulpDeploymentEnv = require("./gulp-deployment-env.json");
  let cdnBasePath = `${gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl}/${gulpDeploymentEnv.Settings.sharePointAppCatalogClientSideAssetsLibrary}/${packageSolutionSettings.solution.id}`;
  cdnBasePath = cdnBasePath.replace(".isa/", ".de/");
  const writeManifestsFileLoc = "./config/write-manifests.json";
  if (fs.existsSync(writeManifestsFileLoc)) {
    var writeManifestsFile = fs.readFileSync(writeManifestsFileLoc).toString();
    writeManifestsFile = writeManifestsFile.replace(/\"cdnBasePath\": \".*\"/gi, `"cdnBasePath": "${cdnBasePath}"`);
    fs.writeFileSync(writeManifestsFileLoc, writeManifestsFile);
  } else {
    var writeManifestsFile = '{"$schema": "https://developer.microsoft.com/json-schemas/spfx-build/write-manifests.schema.json","cdnBasePath": "' + cdnBasePath + '"}';
    fs.writeFileSync(writeManifestsFileLoc, writeManifestsFile);
  }
});

gulp.task("create-security-file", function () {
  const gulpDeploymentEnv = require("./gulp-deployment-env.json");
  console.log("DeploymentEnv: ");
  console.log(JSON.stringify(gulpDeploymentEnv));
  console.log("Checking if file " + "../" + gulpDeploymentEnv.Settings.credentialsFile + " exists...");
  const gulpSettingsSecurityFileLoc = "../" + gulpDeploymentEnv.Settings.credentialsFile;
  if (!fs.existsSync(gulpSettingsSecurityFileLoc)) {
    const readlineSync = require("readline-sync");
    var domain = readlineSync.question("Enter domain: ");
    var username = readlineSync.question("Enter username: ");
    var password = readlineSync.questionNewPassword("Enter password: ");
    var gulpSettingsSecurityFileContent = '{Settings: {"sharePointCredentials": {"domain": "' + domain + '","username": "' + username + '","password": "' + password + '"}}}';
    fs.writeFileSync(gulpSettingsSecurityFileLoc, gulpSettingsSecurityFileContent);
  }
});

gulp.task("prep-for-pipeline-deploy", function () {
  const runSequence = require("run-sequence");
  runSequence("clean", "update-write-manifests");
});

gulp.task("prep-for-deploy", function () {
  const runSequence = require("run-sequence");
  runSequence("clean", "create-security-file", "update-write-manifests");
});

gulp.task("deploy-assets", function () {
  const runSequence = require("run-sequence");
  runSequence("delete-assets", "upload-assets");
});

build.task("add-deploy-sppkg", {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      const gulpDeploymentEnv = require("./gulp-deployment-env.json");
      // Retrieve the package solution file
      const pkgFile = require("./config/package-solution.json");
      // Get the solution name from the package file
      const solutionFile = pkgFile.paths.zippedPackage;
      const fileLocation = `./sharepoint/${solutionFile}`;

      const gulpSettingsSecurity = loadSecurity(gulpDeploymentEnv);
      var credentialOptions = {
        username: gulpSettingsSecurity.sharePointCredentials.username,
        password: gulpSettingsSecurity.sharePointCredentials.password,
        domain: gulpSettingsSecurity.sharePointCredentials.domain
      };

      if (gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl.indexOf(".sharepoint.com") < 0) {
        // Retrieve the file name, this will be used for uploading the solution package to the app catalog
        const fileName = solutionFile.split("/").pop();
        // Retrieve the skip feature deployment setting from the package solution config file
        const skipFeatureDeployment = pkgFile.solution.skipFeatureDeployment ? pkgFile.solution.skipFeatureDeployment : false;

        const through = require("through2");
        // Get the solution file and pass it to the ALM module
        return gulp
          .src(fileLocation)
          .pipe(
            through.obj((file, enc, cb) => {
              const sprequest = require("sp-request");
              let spr = sprequest.create(credentialOptions);
              spr
                .requestDigest(gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl)
                .then((digest) => {
                  spr
                    .post(gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl + "/_api/web/tenantappcatalog/Add(overwrite=true, url='" + fileName + "')", {
                      headers: {
                        "X-RequestDigest": digest,
                        binaryStringRequestBody: true
                      },
                      body: file.contents,
                      responseType: "buffer"
                    })
                    .then((response) => {
                      var responseBody = JSON.parse(response.body);
                      spr
                        .post(gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl + "/_api/web/tenantappcatalog/AvailableApps/GetById('" + responseBody.d.UniqueId + "')/Deploy", {
                          headers: {
                            "X-RequestDigest": digest
                          },
                          body: {
                            skipFeatureDeployment: skipFeatureDeployment
                          }
                        })
                        .then((deployResponse) => {
                          console.log("\x1b[32m", "Successfully deployed app package " + fileName + " with Id " + responseBody.d.UniqueId + " to app catalog " + gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl);
                          cb(null, file);
                        })
                        .catch((err) => {
                          console.log("\x1b[31m", err);
                        });
                    })
                    .catch((err) => {
                      console.log("\x1b[31m", err);
                    });
                })
                .catch((err) => {
                  console.log("\x1b[31m", err);
                });
            })
          )
          .on("finish", resolve);
      } else {
        const spsync = require("gulp-spsync-creds").sync;
        process.env.https_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
        process.env.http_proxy = gulpSettingsSecurity.sharePointCredentials.proxy;
        return gulp
          .src(fileLocation)
          .pipe(
            spsync({
              username: credentialOptions.username,
              password: credentialOptions.password,
              site: gulpDeploymentEnv.Settings.sharePointAppCatalogSiteUrl,
              libraryPath: "AppCatalog",
              publish: true
            })
          )
          .on("finish", resolve);
      }
    });
  }
});

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require("gulp"));
