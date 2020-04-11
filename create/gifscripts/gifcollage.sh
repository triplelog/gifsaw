#!/bin/bash
WIDTH=$((${1}/2+20))
HEIGHT=$((${2}/2+20))
NAME=$3
echo "starting"
for i in 0 1
do
	for ii in 0 1
	do
		gifsicle --crop $(( ii*(${WIDTH}-40) )),$(( i*(${HEIGHT}-40) ))+${WIDTH}x${HEIGHT} ${NAME}.gif -o ${NAME}$(( ii+i*2 )).gif
	done
done
echo "cropped"
convert ${NAME}1.gif -repage $(( 2*${WIDTH} ))x${HEIGHT} -coalesce null: \( ${NAME}0.gif -coalesce \) -geometry +${WIDTH}+0 -layers Composite new${NAME}12.gif
convert ${NAME}3.gif -repage $(( 2*${WIDTH} ))x${HEIGHT} -coalesce null: \( ${NAME}2.gif -coalesce \) -geometry +${WIDTH}+0 -layers Composite new${NAME}34.gif
convert new${NAME}12.gif -repage $(( 2*${WIDTH} ))x$(( 2*${HEIGHT} )) -coalesce null: \( new${NAME}34.gif -coalesce \) -geometry +0+${HEIGHT} -layers Composite new${NAME}14.gif
convert new${NAME}14.gif -repage $(( 4*${WIDTH}-40 ))x$(( 2*${HEIGHT} )) -coalesce null: \( ${NAME}.gif -coalesce \) -geometry +$(( 2*${WIDTH} ))+0 -layers Composite new${NAME}15.gif
echo "converted"
gifsicle -O3 new${NAME}15.gif -o opt${NAME}.gif
