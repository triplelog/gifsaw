import time
import sys
import random
import csv
import math
import json



def writecsv(parr, filen):
		with open(filen, 'w') as csvfile:
				spamwriter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
				for i in range(0,len(parr)):
						try:
								spamwriter.writerow(parr[i])
						except:
								print(parr[i], i)



def readcsvV(filen):
		allgamesa  =[]
		with open(filen, 'rb') as csvfile:
				spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
				for row in spamreader:
					try:
						if row[3] == "HL":
							allgamesa.append([row[0],row[1],row[2],row[4],row[5],row[6],row[7]])
					except:
						pass
		return allgamesa

def readcsv(filen,allgamesa,allgamesV):
		
		with open(filen, 'r') as csvfile:
				spamreader = csv.reader(csvfile, delimiter='\t', quotechar='"')
				for row in spamreader:
						if row[2] == '11/06/2018' and row[4] != 'N':
							try:
								voterage = allgamesV[row[1]][4][-4:]
							except:
								continue
							try:
								allgamesa[row[1]].append(row[0])
								allgamesa[row[1]].append(2018)
							except:
								allgamesa[row[1]]=[voterage,row[0],2018]
						elif row[2] == '11/08/2016' and row[4] != 'N':
							try:
								voterage = allgamesV[row[1]][4][-4:]
							except:
								continue
							try:
								allgamesa[row[1]].append(row[0])
								allgamesa[row[1]].append(2016)
							except:
								allgamesa[row[1]]=[voterage,row[0],2016]
		return allgamesa

def readcsvFreq(filen):
		allgamesa = {}
		with open(filen, 'r') as csvfile:
				spamreader = csv.reader(csvfile, delimiter='\t', quotechar='"')
				for row in spamreader:
						allgamesa[row[0].lower()]=int(row[1])
		return allgamesa


def readcsvWord(filen):
		allgamesa = []
		with open(filen, 'r') as csvfile:
				spamreader = csv.reader(csvfile, delimiter='\t', quotechar='"')
				for row in spamreader:
						allgamesa.append(row[0].lower())
		return allgamesa
				

wordfreq = readcsvFreq('count_1w.txt')

adjectives = []
for i in range(1,3):
	wordpart = readcsvWord('parts/adjectives/'+str(i)+'syllableadjectives.txt')
	for ii in wordpart:
		try:
			if wordfreq[ii]>2999999:
				adjectives.append(ii)
				#print(ii,wordfreq[ii])
		except:
			pass
#print('var adjectives= ',adjectives)
print(len(adjectives))
nouns = []
for i in range(1,3):
	wordpart = readcsvWord('parts/nouns/'+str(i)+'syllablenouns.txt')
	for ii in wordpart:
		try:
			if (wordfreq[ii]>999999 or wordfreq[ii[:-1]]>2999999) and ii[-1]=='s':
				nouns.append(ii)
				#print(ii,wordfreq[ii])
		except:
			pass
#print('var nouns= ',nouns)
print(len(nouns))