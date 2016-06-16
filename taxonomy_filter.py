inputFile = open('../plosthes.2016-1.json', 'r')
outputFile = open('../plosthes.2016-1-filtered.json', 'w')

removeFlag = False
for line in inputFile:
    if line.startswith("            \"nodes\""):
        removeFlag = True
    if line.strip("\n") == "            ]" and removeFlag:
        removeFlag = False
        continue

    if removeFlag:
        continue

    outputFile.write(line)
