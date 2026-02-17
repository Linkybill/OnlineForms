## NOVA-SharePoint-Forms

This is where you include your WebPart documentation.

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

- lib/\* - intermediate-stage commonjs build artifacts
- dist/\* - the bundled script, along with other resources
- deploy/\* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO

working debug url with extensions
loadSPFX=true
&debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fmanifests.js
&customActions=%7B%22565fe5e5-9e6a-4450-a0ec-ccc8597b03e1%22%3A%7B%22location%22%3A%22ClientSideExtension.ListViewCommandSet.CommandBar%22%2C%22properties%22%3A%7B%22sampleTextOne%22%3A%22One%20item%20is%20selected%20in%20the%20list%22%2C%22sampleTextTwo%22%3A%22This%20command%20is%20always%20visible.%22%7D%7D%2C%223c08907f-e984-408b-8ab3-6df1e68030e2%22%3A%7B%22location%22%3A%22ClientSideExtension.ApplicationCustomizer%22%2C%22properties%22%3A%7B%22testMessage%22%3A%22Hallo%20vom%20Debug!%22%7D%7D%7D

Environment:

nvm install 12
nvm use 12
npm install gulp-cli@2.3.0 --global
npm install yo@3.1.1 --global
npm install @microsoft/generator-sharepoint@1.10.0 --global
npm install spfx-fast-serve --global
