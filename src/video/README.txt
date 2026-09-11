HERO VIDEO
==========

  hero.mp4        the vertical cut. Used on phones. Required.
  hero-wide.mp4   optional. A landscape or 4:5 cut. If this file exists,
                  desktop uses it edge to edge with no cropping. If it
                  doesn't, desktop shows the vertical in a centre frame
                  with a blurred surround. Both look fine — the wide cut
                  just looks better.

  hero.webm / hero-wide.webm are optional smaller versions for Chrome
  and Android. Skip them; the .mp4 files work everywhere.

WHY TWO FILES
  A vertical video stretched across a wide desktop hero has to be blown
  up about 3x, so you only see a third of what you filmed. A wide cut
  solves it. Phones stay vertical because that's the shape of the screen.

SPECS — both files
  Length     6-12 seconds, cut so the end flows back into the start
  Sound      none. Strip the audio track. Muted is required for autoplay
  Weight     under 6 MB each. Hard ceiling 10 MB or phones stall
  Format     MP4, H.264, yuv420p
  Frame rate 24 or 30 fps

  hero.mp4        1080 x 1920  (9:16 vertical)
  hero-wide.mp4   1920 x 1080  (16:9)  or  1440 x 1800  (4:5)

MAKING THE WIDE CUT
  4:5 loses a little off the top and bottom. 16:9 loses a lot — a hand
  filmed vertically becomes a narrow strip. If you only have vertical
  footage, use 4:5.

  On an iPhone
    Photos > pick the video > Edit > Crop icon (bottom right)
    > tap the aspect-ratio button (top right) > choose 4:5
    > drag the frame onto the nails > Done > Duplicate, then export

  In CapCut (free)
    New project > add the clip > Ratio > 4:5 > pinch to reposition
    > Export at 1080p

  With ffmpeg
    4:5   ffmpeg -i hero.mp4 -an -vf "crop=ih*4/5:ih,scale=1440:-2" \
            -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart hero-wide.mp4
    16:9  ffmpeg -i hero.mp4 -an -vf "crop=iw:iw*9/16,scale=1920:-2" \
            -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart hero-wide.mp4

BEST RESULT
  Re-frame from the original footage in your editor rather than cropping
  the already-exported file. You keep the quality and you get to choose
  what stays in frame.

POSTER FRAME
  images/hero.jpg shows for the instant before the video starts and stays
  if the video is missing or blocked. Keep it even once video is in.

ABOUT PAGE VIDEO
================

  about.mp4       plays in the big full-bleed block at the top of the
                  About page, straight under "Polished since 2017".
                  Optional — without it the still photo shows instead.

  about.webm      optional smaller version. Skip it.

SPECS
  Shape      1920 x 1080 (16:9). This block is wide, not tall, so a
             landscape clip fits it properly. A vertical phone clip
             will be cropped hard on both sides.
  Length     6-12 seconds, cut so the end flows back into the start
  Sound      none. Strip the audio track
  Weight     2-3 MB. Same ceiling as the hero
  Format     MP4, H.264, yuv420p, faststart

  ffmpeg -i source.mov -an -vf "scale=1920:-2" -c:v libx264 -crf 25 \
    -pix_fmt yuv420p -movflags +faststart about.mp4

STILL IMAGE BEHIND IT
  Set in the admin panel under Salon details > About page photos >
  "Still image behind the About video". Currently about-01.jpg.
  It shows before the video loads and stays if the video is missing,
  so the page never looks broken.
