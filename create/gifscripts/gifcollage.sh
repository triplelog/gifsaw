#!/bin/bash
WIDTH=276
HEIGHT=164
echo "starting"
for i in 0 1
do
	for ii in 0 1
	do
		gifsicle --crop $(( ii*(${WIDTH}-40) )),$(( i*(${HEIGHT}-40) ))+${WIDTH}x${HEIGHT} dodgers.gif -o dodgers$(( ii+i*2 )).gif
	done
done
echo "cropped"
convert dodgers1.gif -repage $(( 2*${WIDTH} ))x${HEIGHT} -coalesce null: \( dodgers0.gif -coalesce \) -geometry +${WIDTH}+0 -layers Composite newdodgers12.gif
convert dodgers3.gif -repage $(( 2*${WIDTH} ))x${HEIGHT} -coalesce null: \( dodgers2.gif -coalesce \) -geometry +${WIDTH}+0 -layers Composite newdodgers34.gif
convert newdodgers12.gif -repage $(( 2*${WIDTH} ))x$(( 2*${HEIGHT} )) -coalesce null: \( newdodgers34.gif -coalesce \) -geometry +0+${HEIGHT} -layers Composite newdodgers14.gif
convert newdodgers14.gif -repage $(( 2*${WIDTH}+512 ))x$(( 2*${HEIGHT} )) -coalesce null: \( dodgers.gif -coalesce \) -geometry +$(( 2*${WIDTH} ))+0 -layers Composite newdodgers15.gif
echo "converted"
gifsicle -O3 newdodgers15.gif -o optdodgers.gif
