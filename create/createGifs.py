import random

f = open('testgif.html','r')
basehtml = f.read()
f.close()



vlines = []
hlines = []
nrows = 4
ncols = 6
width = 960
height = 448
gifurl = "dodgers.gif"
x = []
y = []
xx = []
yy = []
for i in range(0,ncols+1):
	x.append(round(width/(ncols)*i,1))
	xx.append(random.choice([round(-1*width/ncols*.25,1),round(-1*width/ncols*.15,1),round(width/ncols*.15,1),round(width/ncols*.25,1)]))
for i in range(0,nrows+1):
	y.append(round(height/(nrows)*i,1))
	yy.append(random.choice([round(-1*height/nrows*.25,1),round(-1*height/nrows*.15,1),round(height/nrows*.15,1),round(height/nrows*.25,1)]))
for i in range(0,ncols*nrows):
	xdist = [xx[i%ncols],xx[i%ncols+1]]
	ydist = [yy[int(i/ncols)+1],yy[int(i/ncols)]]
	line1 = str(x[i%ncols])+','+str(y[int(i/ncols)])+' '+str(x[i%ncols])+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*2)/3)+' '+str(x[i%ncols]+xdist[0])+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*1)/2)+' '+str(x[i%ncols])+','+str((y[int(i/ncols)+1]*2+y[int(i/ncols)])/3)+' '+str(x[i%ncols])+','+str(y[int(i/ncols)+1])+' '
	line2 = str(x[i%ncols+1])+','+str((y[int(i/ncols)+1]*2+y[int(i/ncols)]*1)/3)+' '+str(x[i%ncols+1]+xdist[1])+','+str((y[int(i/ncols)+1]+y[int(i/ncols)]*1)/2)+' '+str(x[i%ncols+1])+','+str((y[int(i/ncols)+1]*1+y[int(i/ncols)]*2)/3)+' '+str(x[i%ncols+1])+','+str(y[int(i/ncols)])+' '

	if i%ncols==0:
		line1 = str(x[0])+','+str(y[int(i/ncols)])+' '+str(x[0])+','+str(y[int(i/ncols)+1])+' '
	if i%ncols==ncols-1:
		line2 = str(x[ncols])+','+str(y[int(i/ncols)])+' '

	vlines.append([line1,line2])

	line1 = str((x[i%ncols]*2+x[i%ncols+1]*1)/3)+','+str(y[int(i/ncols)+1])+' '+str((x[i%ncols]+x[i%ncols+1]*1)/2)+','+str(y[int(i/ncols)+1]+ydist[0])+' '+str((x[i%ncols]*1+x[i%ncols+1]*2)/3)+','+str(y[int(i/ncols)+1])+' '+str(x[i%ncols+1])+','+str(y[int(i/ncols)+1])+' '
	line2 = str((x[i%ncols+1]*2+x[i%ncols]*1)/3)+','+str(y[int(i/ncols)])+' '+str((x[i%ncols]+x[i%ncols+1]*1)/2)+','+str(y[int(i/ncols)]+ydist[1])+' '+str((x[i%ncols]*2+x[i%ncols+1]*1)/3)+','+str(y[int(i/ncols)])+' '+str(x[i%ncols])+','+str(y[int(i/ncols)])+' '
	
	if int(i/ncols)==0:
		line2 = str(x[i%ncols])+','+str(y[0])+' '
	if int(i/ncols)==nrows-1:
		line1 = str(x[i%ncols+1])+','+str(y[nrows])+' '

	hlines.append([line1,line2])
print(vlines)
print(hlines)
print(soto)
clips = ''
for i in range(0,ncols*nrows):
	
	startStr = '''<clipPath id="clip'''+str(i+1)+'''">
			<path id="path'''+str(i+1)+'''" d="M'''+vlines[i][0]+hlines[i][0]+vlines[i][1]+hlines[i][1]+'''" />
		  </clipPath>
		  '''
	clips += startStr

basehtml = basehtml.replace('clipsgohere',clips)

styles = ''
for i in range(0,ncols*nrows):
	
	startStr = '''#video'''+str(i+1)+''' {
	webkit-clip-path:url(#clip'''+str(i+1)+''');
	clip-path:url(#clip'''+str(i+1)+''');
}
'''
	styles += startStr

basehtml = basehtml.replace('stylesgohere',styles)

gifs = ''	
for i in range(0,ncols*nrows):
	
	startStr = '''<img id="video'''+str(i+1)+'''" width="'''+str(width)+'''" height="'''+str(height)+'''" src="'''+gifurl+'''">
	'''
	gifs += startStr
basehtml = basehtml.replace('gifsgohere',gifs)

vars = 'var npieces= '+str(ncols*nrows)+';\n'

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
vars += 'var matches= '+str(matches)+';\n'

locations = []
for i in range(0,ncols*nrows):
	locations.append([random.randint(0,700),random.randint(10,320)])
vars += 'var locations= '+str(locations)+';\n'

rotations = []
for i in range(0,ncols*nrows):
	rotations.append(random.randint(0,3)*90)
vars += 'var rotations= '+str(rotations)+';\n'

centers = []
for i in range(0,ncols*nrows):
	centers.append([(x[i%ncols]+x[i%ncols+1])/2,(y[int(i/ncols)]+y[int(i/ncols)+1])/2])
vars += 'var centers= '+str(centers)+';'

basehtml = basehtml.replace('varsgohere',vars)
f = open('newpuzzle.html','w')
f.write(basehtml)
f.close()