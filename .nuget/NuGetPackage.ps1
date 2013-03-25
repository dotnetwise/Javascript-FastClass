Param (
    [switch]$Publish
)

$ErrorActionPreference = "Stop"
$ExitCode = 1

function Write-Log {

	#region Parameters
	
		[cmdletbinding()]
		Param(
			[Parameter(ValueFromPipeline=$true)]
			[array] $Messages,

			[Parameter()] [ValidateSet("Error", "Warn", "Info")]
			[string] $Level = "Info",
			
			[Parameter()]
			[Switch] $NoConsoleOut = $false,
			
			[Parameter()]
			[String] $ForegroundColor = 'White',
			
			[Parameter()] [ValidateRange(1,30)]
			[Int16] $Indent = 0,

			[Parameter()]
			[IO.FileInfo] $Path = ".\bin\NuGet.log",
			
			[Parameter()]
			[Switch] $Clobber,
			
			[Parameter()]
			[String] $EventLogName,
			
			[Parameter()]
			[String] $EventSource,
			
			[Parameter()]
			[Int32] $EventID = 1
			
		)
		
	#endregion

	Begin {}

	Process {
        
        $ErrorActionPreference = "Continue"

        if ($Messages.Length -gt 0) {
		    try {			
                foreach($m in $Messages) {			
                    if ($NoConsoleOut -eq $false) {
				        switch ($Level) {
					        'Error' { 
                                Write-Error $m -ErrorAction SilentlyContinue
                                Write-Host ('{0}{1}' -f (" " * $Indent), $m) -ForegroundColor Red
                            }
					        'Warn' { 
                                Write-Warning $m 
                            }
					        'Info' { 
                                Write-Host ('{0}{1}' -f (" " * $Indent), $m) -ForegroundColor $ForegroundColor
                            }
				        }
			        }

                    if ($m.Trim().Length -gt 0) {
			            $msg = '{0}{1} [{2}] : {3}' -f (" " * $Indent), (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level.ToUpper(), $m
    
			            if ($Clobber) {
				            $msg | Out-File -FilePath $Path -Force
			            } else {
				            $msg | Out-File -FilePath $Path -Append
			            }
                    }
			
			        if ($EventLogName) {
			
				        if (-not $EventSource) {
					        $EventSource = ([IO.FileInfo] $MyInvocation.ScriptName).Name
				        }
			
				        if(-not [Diagnostics.EventLog]::SourceExists($EventSource)) { 
					        [Diagnostics.EventLog]::CreateEventSource($EventSource, $EventLogName) 
		                } 

				        $log = New-Object System.Diagnostics.EventLog  
			            $log.set_log($EventLogName)  
			            $log.set_source($EventSource) 
				
				        switch ($Level) {
					        "Error" { $log.WriteEntry($Message, 'Error', $EventID) }
					        "Warn"  { $log.WriteEntry($Message, 'Warning', $EventID) }
					        "Info"  { $log.WriteEntry($Message, 'Information', $EventID) }
				        }
			        }
                }
		    } 
            catch {
			    throw "Failed to create log entry in: '$Path'. The error was: '$_'."
		    }
        }
	}

	End {}

	<#
		.SYNOPSIS
			Writes logging information to screen and log file simultaneously.

		.DESCRIPTION
			Writes logging information to screen and log file simultaneously. Supports multiple log levels.

		.PARAMETER Messages
			The messages to be logged.

		.PARAMETER Level
			The type of message to be logged.
			
		.PARAMETER NoConsoleOut
			Specifies to not display the message to the console.
			
		.PARAMETER ConsoleForeground
			Specifies what color the text should be be displayed on the console. Ignored when switch 'NoConsoleOut' is specified.
		
		.PARAMETER Indent
			The number of spaces to indent the line in the log file.

		.PARAMETER Path
			The log file path.
		
		.PARAMETER Clobber
			Existing log file is deleted when this is specified.
		
		.PARAMETER EventLogName
			The name of the system event log, e.g. 'Application'.
		
		.PARAMETER EventSource
			The name to appear as the source attribute for the system event log entry. This is ignored unless 'EventLogName' is specified.
		
		.PARAMETER EventID
			The ID to appear as the event ID attribute for the system event log entry. This is ignored unless 'EventLogName' is specified.

		.EXAMPLE
			PS C:\> Write-Log -Message "It's all good!" -Path C:\MyLog.log -Clobber -EventLogName 'Application'

		.EXAMPLE
			PS C:\> Write-Log -Message "Oops, not so good!" -Level Error -EventID 3 -Indent 2 -EventLogName 'Application' -EventSource "My Script"

		.INPUTS
			System.String

		.OUTPUTS
			No output.
			
		.NOTES
			Revision History:
				2011-03-10 : Andy Arismendi - Created.
	#>
}

function Create-Process() {
    param([string] $fileName, [string] $arguments)

    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.FileName = $fileName
    $pinfo.Arguments = $arguments

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo

    return $p
}

function HandlePublishError {
    
    # Run NuGet Setup
    $setupTask = Start-Process PowerShell.exe "-ExecutionPolicy Unrestricted -File ..\.nuget\NuGetSetup.ps1 -Url $url" -Wait -PassThru

    if ($setupTask.ExitCode -eq 0) {
        # Try to push package again
		
		if ($url -eq "") {
			Write-Log ("..\.Nuget\NuGet.exe push " + $_)
			$publishTask = Create-Process ..\.Nuget\NuGet.exe ("push " + $_)
		}
		else {
			if ($url -eq "https://nuget.org/api/v2/") {
				Write-Log ("..\.Nuget\NuGet.exe push " + $_)
				$publishTask = Create-Process ..\.Nuget\NuGet.exe ("push " + $_)
			}
			else { 
				Write-Log ("..\.Nuget\NuGet.exe push " + $_ + " -Source " + $url)
				$publishTask = Create-Process ..\.Nuget\NuGet.exe ("push " + $_ + " -Source " + $url)
			}
		}

		
        $publishTask.Start() | Out-Null
        $publishTask.WaitForExit()
            
        $output = ($publishTask.StandardOutput.ReadToEnd() -Split '[\r\n]') |? {$_}
        $error = (($publishTask.StandardError.ReadToEnd() -Split '[\r\n]') |? {$_}) 
        Write-Log $output
        Write-Log $error Error

        if ($publishTask.ExitCode -eq 0) {
            $ExitCode = -1
        }
    }
    else {
        $ExitCode = 0
    }
}

function Publish {

    Write-Log " "
	Write-Log "Publishing package..." -ForegroundColor Green

    # Get nuget config
    [xml]$nugetConfig = Get-Content ..\.Nuget\NuGet.Config
    
    $nugetConfig.configuration.packageSources.add | ForEach-Object {
        $url = $_.value

        Write-Log "Repository Url: $url"
        Write-Log " "

        Get-ChildItem bin\*.nupkg | Sort-Object name -descending | Where-Object { $_.Name.EndsWith(".symbols.nupkg") -eq $false } | ForEach-Object { 

            # Try to push package

			if ($url -eq "") {
				Write-Log ("..\.Nuget\NuGet.exe push " + $_)
				$task = Create-Process ..\.Nuget\NuGet.exe ("push " + $_)
			}
			else {
				if ($url -eq "https://nuget.org/api/v2/") {
					Write-Log ("..\.Nuget\NuGet.exe push " + $_)
					$task = Create-Process ..\.Nuget\NuGet.exe ("push " + $_)
				}
				else { 
					Write-Log ("..\.Nuget\NuGet.exe push " + $_ + " -Source " + $url)
					$task = Create-Process ..\.Nuget\NuGet.exe ("push " + $_ + " -Source " + $url)
				}
			}

            
			Write-Log "Package path: $_" 
            $task.Start() | Out-Null
            $task.WaitForExit()
            
            $output = ($task.StandardOutput.ReadToEnd() -Split '[\r\n]') |? {$_}
            $error = (($task.StandardError.ReadToEnd() -Split '[\r\n]') |? {$_}) 
            Write-Log $output
            Write-Log $error Error
            if ($task.ExitCode -gt 0) {
		        HandlePublishError
            }
            else {
				#just continue with the next repo   
            }                
        }
    }
	$ExitCode = -1
	$host.SetShouldExit($ExitCode)
	Exit $ExitCode 
}

Write-Log " "
Write-Log "NuGet Packager 2.0.0" -ForegroundColor Yellow

# Make sure the nuget executable is writable
Set-ItemProperty ..\.Nuget\NuGet.exe -Name IsReadOnly -Value $false

# Make sure the nupkg files are writeable and create backup
if (Test-Path bin\*.nupkg) {
    Set-ItemProperty bin\*.nupkg -Name IsReadOnly -Value $false

	Write-Log " "
	Write-Log "Creating backup..." -ForegroundColor Green
    Get-ChildItem bin\*.nupkg | ForEach-Object { 
		cd bin
        Move-Item $_.Name ($_.Name + ".bak") -Force
		cd ..
        Write-Log ("Renamed " + $_.Name + " to " + $_.Name + ".bak")
    }
}

Write-Log " "
#Write-Log "Updating NuGet..." -ForegroundColor Green
#Write-Log (Invoke-Command {..\.Nuget\NuGet.exe update -Self} -ErrorAction Stop)

Write-Log " "
Write-Log "Creating package..." -ForegroundColor Green

Invoke-Command {..\.Nuget\MakePP.bat }

# Create symbols package if any .pdb files are located in the lib folderbin\NuGet.log
If ((Get-ChildItem *.pdb -Path .\lib -Recurse).Count -gt 0) {
	$l = (Invoke-Command {..\.Nuget\NuGet.bat pack Package.nuspec -Symbol -OutputDirectory bin -Verbosity Detailed }) 
	Write-Log $l -Level ERROR
    $ExitCode = $LASTEXITCODE
}
Else {
    Write-Log (Invoke-Command {..\.Nuget\NuGet.bat pack Package.nuspec -OutputDirectory bin -Verbosity Detailed})
    $ExitCode = $LASTEXITCODE
}
Invoke-Command {..\.Nuget\UnMakePP.bat }


if ($ExitCode -eq 0){

# Check if package should be published
if ($Publish) {
    Publish
}cmd

}

Write-Log " "
Write-Log "Exit Code: $ExitCode" -ForegroundColor Gray

$host.SetShouldExit($ExitCode)
Exit $ExitCode 