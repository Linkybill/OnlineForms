param(
  [Parameter(Mandatory = $true)]
  [string]$SiteUrl,

  [string]$ListTitle = "Formulartemplates",
  [string]$ConfigListTitle = "FormsConfiguration",
  [string]$ContentTypeName = "FormTemplate",
  [string]$ContentTypeId = "0x0101000C02C51080F16F458E04B9BCD328F38D",
  [string]$TenantId = "e582a74c-4291-40ca-9269-4cd70155bb5c",
  [string]$ClientId = "314d6582-19bc-46fa-994e-146acf3deaa7"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
  Write-Host "PnP.PowerShell is not installed. Install with: Install-Module PnP.PowerShell -Scope CurrentUser"
  exit 1
}

try {
  Connect-PnPOnline -Url $SiteUrl -Interactive
} catch {
  Write-Host "Interactive login failed. Falling back to device login..."
  Connect-PnPOnline -Url $SiteUrl -DeviceLogin -Tenant $TenantId -ClientId $ClientId
}

# Ensure Document Set feature is enabled (Site Collection scope)
$docSetFeatureId = "3bae86a2-776d-499d-9db8-fa4cdc7884f8"
try {
  Enable-PnPFeature -Identity $docSetFeatureId -Scope Site -Force | Out-Null
} catch {
  Write-Host "Document Set feature already active."
}

# Ensure configuration list
$cfgList = Get-PnPList -Identity $ConfigListTitle -ErrorAction SilentlyContinue
if (-not $cfgList) {
  Write-Host "Creating configuration list '$ConfigListTitle'..."
  $cfgList = New-PnPList -Title $ConfigListTitle -Template GenericList
}

# Ensure config fields (Name, Value)
$cfgFields = @(
  @{ InternalName = "Name"; DisplayName = "Name"; Type = "Text" },
  @{ InternalName = "Value"; DisplayName = "Value"; Type = "Note" }
)
foreach ($f in $cfgFields) {
  $existing = Get-PnPField -List $ConfigListTitle -Identity $f.InternalName -ErrorAction SilentlyContinue
  if (-not $existing) {
    Write-Host "Creating config field $($f.InternalName) on '$ConfigListTitle'..."
    Add-PnPField -List $ConfigListTitle -DisplayName $f.DisplayName -InternalName $f.InternalName -Type $f.Type | Out-Null
  }
}

# Ensure document library
$list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
if (-not $list) {
  Write-Host "Creating document library '$ListTitle'..."
  $list = New-PnPList -Title $ListTitle -Template DocumentLibrary
}

# Enable content types on the list
Set-PnPList -Identity $ListTitle -EnableContentTypes $true | Out-Null

# Ensure content type (try fixed ID if supported)
$ct = Get-PnPContentType -Identity $ContentTypeId -ErrorAction SilentlyContinue
if (-not $ct) {
  $ct = Get-PnPContentType -Identity $ContentTypeName -ErrorAction SilentlyContinue
}
if (-not $ct) {
  $parentCt = Get-PnPContentType -Identity "Document"
  Write-Host "Creating content type '$ContentTypeName'..."
  $addCtCmd = Get-Command Add-PnPContentType
  if ($addCtCmd.Parameters.ContainsKey("Id")) {
    Write-Host "Using fixed content type id $ContentTypeId"
    $ct = Add-PnPContentType -Name $ContentTypeName -Id $ContentTypeId -ParentContentType $parentCt -Group "OnlineForms"
  } else {
    Write-Host "Current PnP.PowerShell does not support -Id on Add-PnPContentType; creating with generated id."
    $ct = Add-PnPContentType -Name $ContentTypeName -ParentContentType $parentCt -Group "OnlineForms"
  }
}

# Ensure fields (site columns)
$fields = @(
  @{ InternalName = "TemplateIdentifier"; DisplayName = "TemplateIdentifier"; Type = "Text" },
  @{ InternalName = "VersionIdentifier"; DisplayName = "VersionIdentifier"; Type = "Text" },
  @{ InternalName = "TemplateDescription"; DisplayName = "TemplateDescription"; Type = "Note" },
  @{ InternalName = "ValidFrom"; DisplayName = "ValidFrom"; Type = "DateTime" },
  @{ InternalName = "ValidUntil"; DisplayName = "ValidUntil"; Type = "DateTime" }
)

foreach ($f in $fields) {
  $existing = Get-PnPField -Identity $f.InternalName -ErrorAction SilentlyContinue
  if (-not $existing) {
    Write-Host "Creating field $($f.InternalName)..."
    Add-PnPField -DisplayName $f.DisplayName -InternalName $f.InternalName -Type $f.Type -Group "OnlineForms" | Out-Null
  }
}

# Add fields to content type
foreach ($f in $fields) {
  $ctField = Get-PnPField -Identity $f.InternalName
  $getFieldCmd = Get-Command Get-PnPField
  if ($getFieldCmd.Parameters.ContainsKey("ContentTypeName")) {
    $ctHasField = Get-PnPField -ContentTypeName $ContentTypeName | Where-Object { $_.InternalName -eq $f.InternalName }
  } elseif ($getFieldCmd.Parameters.ContainsKey("ContentType")) {
    $ctHasField = Get-PnPField -ContentType $ContentTypeId | Where-Object { $_.InternalName -eq $f.InternalName }
  } else {
    $ctHasField = @()
  }
  if (-not $ctHasField) {
    $addFieldToCtCmd = Get-Command Add-PnPFieldToContentType
    if ($addFieldToCtCmd.Parameters.ContainsKey("ContentTypeName")) {
      Add-PnPFieldToContentType -Field $ctField -ContentTypeName $ContentTypeName | Out-Null
    } elseif ($addFieldToCtCmd.Parameters.ContainsKey("ContentType")) {
      Add-PnPFieldToContentType -Field $ctField -ContentType $ContentTypeId | Out-Null
    } else {
      Write-Host "Unable to add field to content type: no supported parameter on Add-PnPFieldToContentType"
    }
  }
}

# Ensure fields are added to the list (list columns)
$list = Get-PnPList -Identity $ListTitle -ErrorAction Stop
$listFields = Get-PnPField -List $ListTitle
foreach ($f in $fields) {
  $listHasField = $listFields | Where-Object { $_.InternalName -eq $f.InternalName }
  if (-not $listHasField) {
    Write-Host "Adding field $($f.InternalName) to list '$ListTitle'..."
    try {
      $addFieldToListCmd = Get-Command Add-PnPFieldToList -ErrorAction SilentlyContinue
      if ($addFieldToListCmd) {
        Add-PnPFieldToList -List $ListTitle -Field $f.InternalName | Out-Null
      } else {
        # Fallback: create list-scoped field with same internal name
        Add-PnPField -List $ListTitle -DisplayName $f.DisplayName -InternalName $f.InternalName -Type $f.Type | Out-Null
      }
    } catch {
      Write-Host "Failed to add field $($f.InternalName) to list. Error: $($_.Exception.Message)"
    }
  }
}

# Add content type to list
$listCts = Get-PnPContentType -List $ListTitle
if (-not ($listCts | Where-Object { $_.Name -eq $ContentTypeName -or $_.Id.StringValue -eq $ContentTypeId })) {
  $addCtToListCmd = Get-Command Add-PnPContentTypeToList
  if ($addCtToListCmd.Parameters.ContainsKey("ContentTypeName")) {
    Add-PnPContentTypeToList -List $ListTitle -ContentTypeName $ContentTypeName | Out-Null
  } elseif ($addCtToListCmd.Parameters.ContainsKey("ContentType")) {
    Add-PnPContentTypeToList -List $ListTitle -ContentType $ContentTypeId | Out-Null
  } else {
    Write-Host "Unable to add content type to list: no supported parameter on Add-PnPContentTypeToList"
  }
}

# Add fields to default view (optional)
$defaultView = Get-PnPView -List $ListTitle | Where-Object { $_.DefaultView -eq $true }
$addViewFieldCmd = Get-Command Add-PnPViewField -ErrorAction SilentlyContinue
if ($addViewFieldCmd) {
  foreach ($f in $fields) {
    Add-PnPViewField -List $ListTitle -Identity $defaultView.Id -Fields $f.InternalName -ErrorAction SilentlyContinue | Out-Null
  }
} else {
  Write-Host "Add-PnPViewField not available in this PnP.PowerShell version. Skipping default view update."
}

Write-Host "Done. Library '$ListTitle' is ready."

# Ensure FormTemplate editor page exists and contains the editor web part
$editorPageName = "FormTemplate"
$editorWebPartId = "e2d79a13-0a95-44e4-b1a0-2dc7536cf5ae"

$addPageCmd = Get-Command Add-PnPPage -ErrorAction SilentlyContinue
$addClientSidePageCmd = Get-Command Add-PnPClientSidePage -ErrorAction SilentlyContinue
$getPageCmd = Get-Command Get-PnPPage -ErrorAction SilentlyContinue
$getClientSidePageCmd = Get-Command Get-PnPClientSidePage -ErrorAction SilentlyContinue

$pageExists = $false
if ($getPageCmd) {
  $pageExists = (Get-PnPPage -Identity $editorPageName -ErrorAction SilentlyContinue) -ne $null
} elseif ($getClientSidePageCmd) {
  $pageExists = (Get-PnPClientSidePage -Identity $editorPageName -ErrorAction SilentlyContinue) -ne $null
}

if (-not $pageExists) {
  Write-Host "Creating site page '$editorPageName'..."
  if ($addPageCmd) {
    Add-PnPPage -Name $editorPageName -LayoutType Article | Out-Null
  } elseif ($addClientSidePageCmd) {
    Add-PnPClientSidePage -Name $editorPageName -LayoutType Article | Out-Null
  }
}

$addPageWebPartCmd = Get-Command Add-PnPPageWebPart -ErrorAction SilentlyContinue
$addClientSideWebPartCmd = Get-Command Add-PnPClientSideWebPart -ErrorAction SilentlyContinue

if ($addPageWebPartCmd) {
  Write-Host "Ensuring editor web part on page '$editorPageName'..."
  Add-PnPPageWebPart -Page $editorPageName -Component $editorWebPartId -Section 1 -Column 1 -ErrorAction SilentlyContinue | Out-Null
} elseif ($addClientSideWebPartCmd) {
  Write-Host "Ensuring editor web part on page '$editorPageName'..."
  Add-PnPClientSideWebPart -Page $editorPageName -Component $editorWebPartId -Section 1 -Column 1 -ErrorAction SilentlyContinue | Out-Null
} else {
  Write-Host "No cmdlet available to add web part to page. Please add web part manually to '$editorPageName.aspx'."
}

# Ensure FormInstance page exists and contains the form instance web part
$instancePageName = "FormInstance"
$instanceWebPartId = "e964329e-b191-48d6-b472-e7be7b36af8e"

$instancePageExists = $false
if ($getPageCmd) {
  $instancePageExists = (Get-PnPPage -Identity $instancePageName -ErrorAction SilentlyContinue) -ne $null
} elseif ($getClientSidePageCmd) {
  $instancePageExists = (Get-PnPClientSidePage -Identity $instancePageName -ErrorAction SilentlyContinue) -ne $null
}

if (-not $instancePageExists) {
  Write-Host "Creating site page '$instancePageName'..."
  if ($addPageCmd) {
    Add-PnPPage -Name $instancePageName -LayoutType Article | Out-Null
  } elseif ($addClientSidePageCmd) {
    Add-PnPClientSidePage -Name $instancePageName -LayoutType Article | Out-Null
  }
}

if ($addPageWebPartCmd) {
  Write-Host "Ensuring form instance web part on page '$instancePageName'..."
  Add-PnPPageWebPart -Page $instancePageName -Component $instanceWebPartId -Section 1 -Column 1 -ErrorAction SilentlyContinue | Out-Null
} elseif ($addClientSideWebPartCmd) {
  Write-Host "Ensuring form instance web part on page '$instancePageName'..."
  Add-PnPClientSideWebPart -Page $instancePageName -Component $instanceWebPartId -Section 1 -Column 1 -ErrorAction SilentlyContinue | Out-Null
} else {
  Write-Host "No cmdlet available to add web part to page. Please add web part manually to '$instancePageName.aspx'."
}
