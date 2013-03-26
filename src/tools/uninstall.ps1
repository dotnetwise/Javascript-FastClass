# Runs every time a package is uninstalled

param($installPath, $toolsPath, $package, $project)

# $installPath is the path to the folder where the package is installed.
# $toolsPath is the path to the tools directory in the folder where the package is installed.
# $package is a reference to the package object.
# $project is a reference to the project the package was installed to.

$file = $project.ProjectItems | ForEach-Object { $_.ProjectItems } | where { $_.Name -eq "_references.js" }
if($file) {
    $file.Open()
    $file.Document.Activate()
    #$file.Document.Selection.SelectAll() 
    $file.Document.Selection.StartOfDocument()
	$file.Document.ReplaceText("/// <reference path=`"FastClass.js`" />`n", "")
} 