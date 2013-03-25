# Runs the first time a package is installed in a solution, and every time the solution is opened.

param($installPath, $toolsPath, $package, $project)

# $installPath is the path to the folder where the package is installed.
# $toolsPath is the path to the tools directory in the folder where the package is installed.
# $package is a reference to the package object.
# $project is null in init.ps1

$file = $project.ProjectItems | ForEach-Object { $_.ProjectItems } | where { $_.Name -eq "_references.js" }
if($file) {
    $file.Open()
    $file.Document.Activate()
    $file.Document.Selection.SelectAll()
    $file.Document.Selection.StartOfDocument()
    $file.Document.Selection.Insert('/// <reference path="FastClass.js" />\n')
    $file.Document.Close(0)
}