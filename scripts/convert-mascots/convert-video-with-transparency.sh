#!/bin/bash

# Video to Transparent WebM and GIF Converter
# This script takes a video file with a background color and:
# 1. Creates a WebM with transparency (VP9 codec with alpha channel)
# 2. Creates a GIF with transparency using colorkey filter
#
# Usage: ./convert-video-with-transparency.sh <input-filename> <background-color> [output-name]
#
# Examples:
#   ./convert-video-with-transparency.sh video.mp4 "#EBE9E6" mocksybot
#   ./convert-video-with-transparency.sh dance.mov "0xFFFFFF" mocksy-dancing
#
# Parameters:
#   input-filename: Filename in the input/ folder (e.g., video.mp4)
#   background-color: Hex color to remove (format: #RRGGBB or 0xRRGGBB)
#   output-name: (optional) Base name for output files, defaults to input filename

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo ""
    echo "Usage: $0 <input-file> [background-color] [output-name]"
    echo ""
    echo "Examples:"
    echo "  $0 video.mp4 \"#EBE9E6\" mocksybot"
    echo "  $0 dance.mov \"auto\" mocksy-dancing    # Auto-detect background"
    echo "  $0 viking.mp4                          # Auto-detect with default name"
    echo ""
    echo "Parameters:"
    echo "  input-filename    Filename in input/ folder (e.g., video.mp4)"
    echo "  background-color  Hex color to remove (format: #RRGGBB or 0xRRGGBB), or 'auto' to detect"
    echo "  output-name       (optional) Base name for output files"
    exit 1
fi

INPUT_FILENAME="$1"
BG_COLOR="${2:-auto}"
OUTPUT_NAME="${3:-$(basename "$INPUT_FILENAME" | sed 's/\.[^.]*$//')}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define input and output directories relative to script location
INPUT_DIR="$SCRIPT_DIR/input"
OUTPUT_DIR="$SCRIPT_DIR/output"

# Full path to input file
INPUT_FILE="$INPUT_DIR/$INPUT_FILENAME"

# Validate input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}Error: Input file '$INPUT_FILE' not found${NC}"
    echo -e "${YELLOW}Make sure to place your video in: $INPUT_DIR${NC}"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Auto-detect background color if requested
if [[ $BG_COLOR == "auto" ]]; then
    echo -e "${YELLOW}Auto-detecting background color...${NC}"

    # Extract first frame and sample corner pixels to find the most common color
    # We sample 4 corners and the edges to determine background
    DETECTED_COLOR=$(ffmpeg -i "$INPUT_FILE" -vframes 1 -vf "crop=20:20:0:0" -f rawvideo -pix_fmt rgb24 - 2>/dev/null | \
        od -An -tuC | \
        awk 'NR<=200 {r+=$1; g+=$2; b+=$3; n++} END {printf "0x%02X%02X%02X\n", r/n, g/n, b/n}')

    BG_COLOR="$DETECTED_COLOR"
    echo -e "${GREEN}Detected background color: ${YELLOW}$BG_COLOR${NC}"
fi

# Convert hex color format if needed (#RRGGBB -> 0xRRGGBB)
if [[ $BG_COLOR == \#* ]]; then
    BG_COLOR="0x${BG_COLOR:1}"
fi

echo -e "${GREEN}=== Video Transparency Converter ===${NC}"
echo -e "Input file:       ${YELLOW}$INPUT_FILE${NC}"
echo -e "Background color: ${YELLOW}$BG_COLOR${NC}"
echo -e "Output name:      ${YELLOW}$OUTPUT_NAME${NC}"
echo -e "Output directory: ${YELLOW}$OUTPUT_DIR${NC}"
echo ""

# Step 1: Create WebM with transparency
echo -e "${GREEN}[1/2] Creating WebM with transparency...${NC}"
WEBM_OUTPUT="$OUTPUT_DIR/$OUTPUT_NAME.webm"

ffmpeg -i "$INPUT_FILE" \
    -vf "colorkey=${BG_COLOR}:0.08:0.03,format=yuva420p,split[color][alpha];[alpha]alphaextract,gblur=sigma=0.8[alphablur];[color][alphablur]alphamerge" \
    -c:v libvpx-vp9 \
    -pix_fmt yuva420p \
    -auto-alt-ref 0 \
    -b:v 0 \
    -crf 30 \
    -y \
    "$WEBM_OUTPUT"

echo -e "${GREEN}✓ WebM created: $WEBM_OUTPUT${NC}"

# Get video dimensions for sizing
WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$INPUT_FILE")
HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$INPUT_FILE")

# Calculate target size for GIF (max dimension 400px)
if [ "$WIDTH" -gt "$HEIGHT" ]; then
    TARGET_SIZE="400:-1"
else
    TARGET_SIZE="-1:400"
fi

# Step 2: Create GIF with transparency
echo -e "${GREEN}[2/2] Creating GIF with transparency...${NC}"
GIF_OUTPUT="$OUTPUT_DIR/$OUTPUT_NAME.gif"

ffmpeg -i "$INPUT_FILE" \
    -vf "fps=24,scale=$TARGET_SIZE:flags=lanczos,colorkey=${BG_COLOR}:0.08:0.03,format=yuva420p,split[vid][alpha];[alpha]alphaextract,gblur=sigma=0.8[alphablur];[vid][alphablur]alphamerge,format=rgba,split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse=dither=none:alpha_threshold=128" \
    -y \
    "$GIF_OUTPUT"

echo -e "${GREEN}✓ GIF created: $GIF_OUTPUT${NC}"

# Get file sizes
WEBM_SIZE=$(du -h "$WEBM_OUTPUT" | cut -f1)
GIF_SIZE=$(du -h "$GIF_OUTPUT" | cut -f1)

echo ""
echo -e "${GREEN}=== Conversion Complete ===${NC}"
echo -e "WebM: ${YELLOW}$WEBM_OUTPUT${NC} (${WEBM_SIZE})"
echo -e "GIF:  ${YELLOW}$GIF_OUTPUT${NC} (${GIF_SIZE})"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the output files in the 'output/' folder"
echo "2. If transparency looks good, copy them to your public folder:"
echo -e "   ${YELLOW}cp output/$OUTPUT_NAME.* ../../public/${NC}"
echo "3. Update your code to use these files with Safari detection"
