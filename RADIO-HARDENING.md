# NEON PLAYER X — Radio Hardening

This patch preserves the existing UI and project architecture while hardening the radio path.

## Corrections
- Radio stations now have a same-origin `/api/radio/stream/:id` proxy, reducing browser-side CORS/redirect problems.
- The proxy is allowlisted to the 12 existing station URLs; it does not accept arbitrary upstream URLs, avoiding an open SSRF proxy.
- Radio startup now waits for the real `playing` event with a bounded timeout instead of assuming that `audio.play()` resolved means audio data is already flowing.
- Retry scheduling is de-duplicated and stale station requests are ignored.
- The radio equalizer no longer inserts `MediaElementAudioSourceNode` between external radio streams and the speakers. External streams without CORS headers can otherwise produce silence or break the Web Audio graph.
- The visual radio EQ remains active as a visualization; the five radio sliders are retained as UI compatibility controls, while actual audio remains direct and stable.
- Network recovery and manual refresh continue to work.

## Verification
- JavaScript syntax checks pass.
- Full Node test suite passes: 6/6.

## Live-stream limitation
The build environment used for this package could not resolve external radio hosts, so upstream station reachability could not be live-verified from here. The application therefore retains the existing station URLs plus runtime discovery/fallback behavior rather than claiming that every external station is currently broadcasting.
