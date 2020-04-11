import random

vlines = []
hlines = []
nrows = 5
ncols = 6
x = []
y = []
for i in range(0,ncols+1):
	x.append(560/(ncols)*i)
for i in range(0,nrows+1):
	y.append(315/(nrows)*i)
for i in range(0,ncols*nrows):
	
	line1 = str(x[i%ncols])+','+str(y[int(i/ncols)])+' '+str(x[i%ncols])+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*2)/3)+' '+str(x[i%ncols]+20)+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*1)/2)+' '+str(x[i%ncols])+','+str((y[int(i/ncols)+1]*2+y[int(i/ncols)])/3)+' '+str(x[i%ncols])+','+str(y[int(i/ncols)+1])+' '
	line2 = str(x[i%ncols+1])+','+str((y[int(i/ncols)+1]*2+y[int(i/ncols)]*1)/3)+' '+str(x[i%ncols+1]+20)+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*1)/2)+' '+str(x[i%ncols+1])+','+str((y[int(i/ncols)+1]*1+y[int(i/ncols)]*2)/3)+' '+str(x[i%ncols+1])+','+str(y[int(i/ncols)])+' '

	if i%ncols==0:
		line1 = str(x[0])+','+str(y[int(i/ncols)])+' '+str(x[0])+','+str(y[int(i/ncols)+1])+' '
	if i%ncols==ncols-1:
		line2 = str(x[ncols])+','+str(y[int(i/ncols)])+' '

	vlines.append([line1,line2])

	line1 = str((x[i%ncols]*2+x[i%ncols+1]*1)/3)+','+str(y[int(i/ncols)+1])+' '+str((x[i%ncols]+x[i%ncols+1]*1)/2)+','+str(y[int(i/ncols)+1]+20)+' '+str((x[i%ncols]*1+x[i%ncols+1]*2)/3)+','+str(y[int(i/ncols)+1])+' '+str(x[i%ncols+1])+','+str(y[int(i/ncols)+1])+' '
	line2 = str((x[i%ncols+1]*2+x[i%ncols]*1)/3)+','+str(y[int(i/ncols)])+' '+str((x[i%ncols]+x[i%ncols+1]*1)/2)+','+str(y[int(i/ncols)]+20)+' '+str((x[i%ncols]*2+x[i%ncols+1]*1)/3)+','+str(y[int(i/ncols)])+' '+str(x[i%ncols])+','+str(y[int(i/ncols)])+' '
	
	if int(i/ncols)==0:
		line2 = str(x[i%ncols])+','+str(y[0])+' '
	if int(i/ncols)==nrows-1:
		line1 = str(x[i%ncols+1])+','+str(y[nrows])+' '

	hlines.append([line1,line2])


for i in range(0,ncols*nrows):
	
	startStr = '''<clipPath id="clip'''+str(i+1)+'''">
			<path id="path'''+str(i+1)+'''" d="M'''+vlines[i][0]+hlines[i][0]+vlines[i][1]+hlines[i][1]+'''" />
		  </clipPath>'''
	print(startStr)

for i in range(0,ncols*nrows):
	
	startStr = '''#video'''+str(i+1)+''' {
	webkit-clip-path:url(#clip'''+str(i+1)+''');
	clip-path:url(#clip'''+str(i+1)+''');
}'''
	print(startStr)
	
for i in range(0,ncols*nrows):
	
	startStr = '''<video id="video'''+str(i+1)+'''" width="560" height="315" loop>
	<source src="sample.mp4" type="video/mp4">
</video>'''
	print(startStr)
	
matches = {}
for i in range(0,ncols*nrows):
	
	matches['video'+str(i+1)]=[]
	if i%ncols<ncols-1:
		matches['video'+str(i+1)].append('video'+str(i+2))
	if i%ncols>0:
		matches['video'+str(i+1)].append('video'+str(i))
	if int(i/ncols)<nrows-1:
		matches['video'+str(i+1)].append('video'+str(i+1+ncols))
	if int(i/ncols)>0:
		matches['video'+str(i+1)].append('video'+str(i+1-ncols))
print('var matches= ',matches,';')

locations = []
for i in range(0,ncols*nrows):
	locations.append([random.randint(50,700),random.randint(50,400)])
print('var locations= ',locations,';')

centers = []
for i in range(0,ncols*nrows):
	centers.append([(x[i%ncols]+x[i%ncols+1])/2,(y[int(i/ncols)]+y[int(i/ncols)+1])/2])
print('var centers= ',centers,';')