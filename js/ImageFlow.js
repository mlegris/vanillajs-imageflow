import {EventDispatcher} from "./EventDispatcher.js";

const nextImage = "NEXT_IMAGE";
const previousImage = "PREVIOUS_IMAGE";
const mouseDrag = "MOUSE_DRAG";
const touchDrag = "TOUCH_DRAG";

class ImageFlow extends EventDispatcher {
    imageUrls = [];
    dotsCont = null;
    imageCont = null;
    touchId = null;
    downAt = null;
    upAt = null;
    downX = null;
    downY = null;
    upX = null;
    upY = null;
    offsetX = null;
    offsetY = null;
    timeoutId = null;
    position = 0;

    touchStartHandler = null;
    touchMoveHandler = null;
    touchEndHandler = null;
    mouseUpHandler = null;
    mouseMoveHandler = null;
    mouseDownHandler = null;
    totalWidth = 0;
    engaged = false;

    static get nextImage() { return nextImage; }
    static get previousImage() { return previousImage; }
    static get mouseDrag() { return mouseDrag; }
    static get touchDrag() { return touchDrag; }

    constructor(placeHolderEl, imageUrls)
    {
        super();
        this.contEl = placeHolderEl;
        this.imageUrls = imageUrls;
        this.createElements();
        this.initEvents();
    }

    createElements()
    {
        this.createDots();
        this.createImages();
        this.imageCont.style.pointerEvents = "none";
    }

    initEvents()
    {
        this.touchStartHandler = this.touchStart.bind(this);
        this.touchMoveHandler = this.touchMove.bind(this);
        this.touchEndHandler = this.touchEnd.bind(this);
        this.mouseUpHandler = this.mouseUp.bind(this);
        this.mouseMoveHandler = this.mouseMove.bind(this);
        this.mouseDownHandler = this.mouseDown.bind(this);
        this.contEl.addEventListener("touchstart", this.touchStartHandler);
        this.contEl.addEventListener("mousedown", this.mouseDownHandler);
        window.addEventListener("resize", this.windowResized.bind(this));
    }

    windowResized(e)
    {
        const width = this.contEl.offsetWidth;
        const height = this.contEl.offsetHeight;
        this.totalWidth = this.imageUrls.length * width;
        const thumbEls = this.contEl.querySelectorAll("div.thumbContainer");

        for(const thumbEl of thumbEls) {
            thumbEl.style.width = width + "px";
            thumbEl.style.height = height + "px";
        }
        const finalX = -this.position * width;
        this.imageCont.style.left = finalX+"px";
    }

    createDots()
    {
        const count = this.imageUrls.length;
        this.dotsCont = document.createElement("div");
        this.dotsCont.className = "dots";
        this.contEl.appendChild(this.dotsCont);

        for(const picUrl of this.imageUrls)
        {
            const dotEl = document.createElement("span");
            dotEl.className = "dot";
            dotEl.setAttribute("url", picUrl);
            this.dotsCont.appendChild(dotEl);
        }

        if(count > 0)
            this.dotsCont.children[0].setAttribute("selected", "");
    }

    createImages()
    {
        this.totalWidth = this.imageUrls.length * this.contEl.offsetWidth;
        this.imageCont = document.createElement("div");
        this.imageCont.className = "images";
        this.contEl.appendChild(this.imageCont);
        this.imageCont.style.left = 0+"px";

        for(const picUrl of this.imageUrls)
        {
            const thumbContEl = document.createElement("div");
            thumbContEl.className = "thumbContainer";
            this.imageCont.appendChild(thumbContEl);
            thumbContEl.style.display = "inline-block";
            thumbContEl.style.overflow = "hidden";
            thumbContEl.style.width = this.contEl.offsetWidth + "px";
            thumbContEl.style.height = this.contEl.offsetHeight + "px";
            const imgEl = document.createElement("img");
            imgEl.className = "thumb";
            imgEl.setAttribute("src", picUrl);
            imgEl.setAttribute("loading", "lazy");
            thumbContEl.appendChild(imgEl);
        }
    }

    isClick()
    {
        const dX = this.upX - this.downX;
        const dY = this.upY - this.downY;
        const distance = Math.sqrt(dX * dX + dY * dY);
        const elapsed = this.upAt - this.downAt;
        const click = (elapsed < 250 && distance < screen.availWidth * 0.05);
        return click;
    }

    mouseDown(e)
    {
        this.engaged = false;
        this.pointerStart(e);
        document.body.addEventListener("mousemove", this.mouseMoveHandler);
        document.body.addEventListener("mouseup", this.mouseUpHandler);
        document.body.addEventListener("mouseleave", this.mouseUpHandler);
    }

    mouseMove(e)
    {
        const x = e.clientX;
        const aDx = Math.abs(x - this.downX);
        const width = this.contEl.offsetWidth;
        if(!this.engaged && aDx > 10) {
            this.contEl.setAttribute("dragging", "");
            this.engaged = true;
            this.dispatchEvent(mouseDrag, {});
        }

        if(this.engaged)
            e.preventDefault();

        this.pointerMove(e);
    }

    previous()
    {
        const width = this.contEl.offsetWidth;
        const left = parseInt(this.imageCont.style.left.replace(/px/, ""));
        if(left + width <= 0)
        {
            const newOffsetX = left + width;
            const itemIndex = Math.round(-newOffsetX / width);
            this.applyPosition(newOffsetX, itemIndex);
            this.dispatchEvent(previousImage, { index: itemIndex });
        }
    }

    next()
    {
        const width = this.contEl.offsetWidth;
        const left = parseInt(this.imageCont.style.left.replace(/px/, ""));
        if(-(left - width) <= (this.totalWidth-width))
        {
            const newOffsetX = left - width;
            const itemIndex = Math.round(-newOffsetX / width);
            this.applyPosition(newOffsetX, itemIndex);
            this.dispatchEvent(nextImage, { index: itemIndex });
        }
    }

    mouseUp(e)
    {
        this.upX = e.clientX;
        this.upY = e.clientY;
        this.pointerEnd();

        this.contEl.removeAttribute("dragging");
        document.body.removeEventListener("mousemove", this.mouseMoveHandler);
        document.body.removeEventListener("mouseup", this.mouseUpHandler);
        document.body.removeEventListener("mouseleave", this.mouseUpHandler);
        if(this.engaged)
            e.preventDefault();

        this.downX = this.upX = this.downY = this.upY = 0;
        this.downAt = -1;
        this.upAt = -1;
    }

    touchStart(e) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        if (this.touchId)
            return;

        this.engaged = false;
        this.touchId = e.changedTouches[0].id;
        this.pointerStart(e.changedTouches[0]);

        document.body.addEventListener("touchmove", this.touchMoveHandler, { passive: false });
        document.body.addEventListener("touchend", this.touchEndHandler, { passive: false });
        document.body.addEventListener("touchcancel", this.touchEndHandler, { passive: false });
    }

    touchMove(e) {
        if(this.touchId === null)
            return;

        let targetTouch = null;
        for(const touch of e.changedTouches)
        {
            if(touch.id === this.touchId)
                targetTouch = touch;
        }

        if(targetTouch === null)
            return;

        if(!this.engaged) {
            const aDX = Math.abs(targetTouch.clientX - this.downX);
            const aDY = Math.abs(targetTouch.clientY - this.downY);
            console.log("NOT ENGAGED: aDx["+aDX+"] aDy["+aDY+"]")
            if (aDY > aDX && aDY > 15) {
                console.log("DISABLING");
                this.engaged = false;
                document.body.removeEventListener("touchmove", this.touchMoveHandler);
            } else if (aDX > aDY && aDX > 10) {
                this.engaged = true;
                this.dispatchEvent(touchDrag, {});
            }
        }

        if(this.engaged) {
            e.preventDefault();
            this.pointerMove(targetTouch);
        }
    }

    touchEnd(e)
    {
        for(const touch of e.changedTouches) {
            if(touch.id === this.touchId) {
                this.touchId = null;

                this.upX = touch.clientX;
                this.upY = touch.clientY;
                this.pointerEnd();
                e.preventDefault();

                /*if(!this.isClick()) {

                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }*/

                document.body.removeEventListener("touchmove", this.touchMoveHandler);
                document.body.removeEventListener("touchend", this.touchEndHandler);
                document.body.removeEventListener("touchcancel", this.touchEndHandler);
                this.engaged = false;
                break;
            }
        }
    }

    pointerStart(obj)
    {
        this.offsetX = this.imageCont.offsetLeft;
        this.offsetY = this.imageCont.offsetTop;
        this.downX = obj.clientX;
        this.downY = obj.clientY;
        this.downAt = Date.now();
        this.imageCont.style.transition = "";
        this.imageCont.style.filter = "saturate(1)";
        this.dotsCont.style.opacity = 1;
    }

    pointerMove(obj)
    {
        const x = obj.clientX;
        const dx = x - this.downX;
        const width = this.contEl.offsetWidth;
        const newOffsetX = Math.max(Math.min(0, this.offsetX + dx), width - this.totalWidth);
        const itemIndex = Math.round(-newOffsetX / width);
        this.applyPosition(newOffsetX, itemIndex);
    }

    applyPosition(newOffsetX, itemIndex)
    {
        const dotEls = Array.from(this.dotsCont.querySelectorAll("span.dot"));
        for(const dotEl of dotEls)
            dotEl.removeAttribute("selected");
        itemIndex = Math.max(0, Math.min(itemIndex, dotEls.length - 1));
        const dotEl = dotEls[itemIndex];
        dotEl.setAttribute("selected", "");
        this.imageCont.style.left = newOffsetX+"px";
    }

    pointerEnd() {
        this.upAt = Date.now();
        const x = this.upX;
        const dx = x - this.downX;
        const width = this.contEl.offsetWidth;
        const downX = this.downX;
        const left = this.contEl.getBoundingClientRect().left;
        const newOffsetX = Math.max(Math.min(0, this.offsetX + dx), width - this.totalWidth);
        const itemIndex = Math.round(-newOffsetX / width);
        this.position = itemIndex;
        const wasClick = this.isClick();

        this.imageCont.style.transition = "left 0.2s ease-out";
        const finalX = -itemIndex * width;
        const that = this;
        this.timeoutId = setTimeout(function () {
            if (wasClick) {
                const pos = (downX - left) / width;
                if (pos < 0.25)
                    that.previous();
                else if (pos > 0.75)
                    that.next();
                else
                    that.dispatchEvent("click", {});
            } else
                that.imageCont.style.left = finalX + "px";

            that.timeoutId = setTimeout(function () {
                that.dotsCont.style.opacity = "";
                that.imageCont.style.filter = "";
            }, 200);
        }, 50);
    }
}

export { ImageFlow };