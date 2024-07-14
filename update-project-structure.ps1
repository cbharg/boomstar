$excludeDirs = @("node_modules", ".git")
$excludeFiles = @(".DS_Store", "*.log", "*.lock")

function Get-DirectoryTree {
    param (
        [string]$path,
        [string]$indent = ""
    )

    $items = Get-ChildItem -Path $path | Where-Object {
        ($excludeDirs -notcontains $_.Name) -and ($excludeFiles -notcontains $_.Extension)
    }

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Write-Output "$indent|-- $($item.Name)"
            Get-DirectoryTree -path $item.FullName -indent "$indent   "
        } else {
            Write-Output "$indent|-- $($item.Name)"
        }
    }
}

Get-DirectoryTree -path $PWD > project-structure.txt
