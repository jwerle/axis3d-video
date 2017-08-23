Streaming video to a texture with Axis3D
========================================

This post is intended to describe the modules exposed in `axis3d-video`.
It describes various streaming solutions, playback considerations,
device caveats, OS specific color correction, and hopefully an example
of how to extend and use [axis3D](https://github.com/littlstar/axis3d).

# Preface

Streaming a video over the network in a web browser today involves 1 of
3 preferred solutions:

* Streaming (CBR)
* Progressive download (VBR)
* Adaptive Bitrate (ABR)

## CBR

`CBR` stands for constant bitrate and allows for streaming media on
limited bandwidth. It often not beneficial as a solution due to the
bitrate being constant and the constraint on connectivity bandwidth. It
doesn't prove useful for storage because as the bitrate increase, the
required storage does proportionally.

*See https://en.wikipedia.org/wiki/Constant_bitrate for more information
on CBR.*

## VBR

`VBR` stands for variable bitrate and allows a higher bitrate
to be allocated to more complex segments of media files while less space
is allocated to less complex segments. This proves advantageous because
it produces "better quality-to-space ratio compared to a CBR file of the
same data"

*See https://en.wikipedia.org/wiki/Variable_bitrate for more information
on VBR.*

## ABR

`ABR` stands for adaptive bitrate and is the most modern solution for
streaming media today. It leverages HTTP today, while others have leveraged
RTP and RTSP in the past.

