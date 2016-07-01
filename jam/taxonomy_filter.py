import os

inputFile = open('../plosthes.2016-1.json', 'r')
outputFile = open('../plosthes.2016-1-filtered.json', 'w')

removeFlag = False
prevLine = ""
for line in inputFile:
    if line.startswith("            \"nodes\""):
        outputFile.seek(-2, os.SEEK_CUR)
        outputFile.write("\n")
        removeFlag = True
    if line.strip("\n") == "            ]" and removeFlag:
        removeFlag = False
        continue

    if removeFlag:
        continue

    outputFile.write(line)
