from openpyxl import load_workbook
import sys

wb = load_workbook(filename='../plosthes.2016-1.full.xlsx', read_only=True)
ws = wb.active

print "{"

isFirst = True
prevTier = -1
for row in ws.rows:
    if isFirst:
        isFirst = False
        continue

    currTier = 0
    for cell in row:
        currTier += 1
        if cell.value is not None:
            # if currTier < prevTier:
            #     for i in range(currTier, prevTier):
            #         print "},"
            #         for _ in range(0, currTier - i):
            #             sys.stdout.write("\t")
            #
            if currTier <= prevTier:
                for i in reversed(range(currTier, prevTier+1)):
                    for _ in range(1, i):
                        sys.stdout.write("\t")
                    sys.stdout.write("},\n")
                for _ in range(1, currTier):
                    sys.stdout.write("\t")
            else:
                for _ in range(1, currTier):
                    sys.stdout.write("\t")
            sys.stdout.write("'" + cell.value.encode(encoding='UTF-8') + "': {\n")
            break

    prevTier = currTier

print "\t\t},\n}"

sys.stdout.flush()
