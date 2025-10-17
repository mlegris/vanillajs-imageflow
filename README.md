# vanillajs-imageflow
A simple yet complete image flow component to show multiple images with a touch/mouse drag or tap to switch images. Like the Instagram interface for viewing posts.
[you can try it here]([/guides/content/editing-an-existing-page#modifying-front-matter](https://blog.obviousleap.co/demos/imageFlowTut/))

# USAGE
Please look at the index.html file to see what css styles need to be applied.

```javascript
import { ImageFlow } from "./js/ImageFlow.js";
    updateOrientation();

    const img1Urls = ["rise_against1.jpg", "rise_against2.jpg", "rise_against3.jpg", "rise_against4.jpg", "rise_against5.jpg", "rise_against6.jpg", "rise_against7.jpg", "rise_against8.jpg", "rise_against9.jpg"];
    const cont1El = document.querySelector("div#flow1")
    const flow = new ImageFlow(cont1El, img1Urls);

    const img2Urls = ["infected_mushroom1.jpg", "infected_mushroom2.jpg", "infected_mushroom3.jpg", "infected_mushroom4.jpg", "infected_mushroom5.jpg", "infected_mushroom6.jpg"];
    const cont2El = document.querySelector("div#flow2")
    const flow2 = new ImageFlow(cont2El, img2Urls);

flow.addEventListener(ImageFlow.nextImage, function(e) {
    // fired when the interface switches to the next image
});

flow.addEventListener(ImageFlow.previousImage, function(e) {
// fired when the interface switches to the previous image
});

flow.addEventListener(ImageFlow.mouseDrag, function(e) {
    // fired when the user uses the mouse to drag the image
});

flow.addEventListener(ImageFlow.touchDrag, function(e) {
    // fired when the user uses touch input to drag the image
});
```

# CREDITS
I developed it while working on Troove.

[![alt text](https://troove.app/favicon-192x192.png "Troove Logo")](https://troove.app)

# LICENSE
Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg
