#!/bin/bash

RAW_DIR="../videos/raw"
OUT_DIR="../videos/hls"

mkdir -p $OUT_DIR

for file in $RAW_DIR/*; do
    filename=$(basename "$file")
    name="${filename%.*}"

    echo "🚀 Converting: $filename"

    mkdir -p "$OUT_DIR/$name"

    ffmpeg -i "$file" \
    -profile:v baseline \
    -level 3.0 \
    -start_number 0 \
    -hls_time 4 \
    -hls_list_size 0 \
    -f hls "$OUT_DIR/$name/index.m3u8"

    echo "✅ Done: $name"
done

echo "🎉 All videos converted to HLS!"