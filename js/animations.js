// title card text load in
gsap.from(".content > *", {
    duration: 1,
    y: -30,
    opacity: 0,
    stagger: 0.12,
    ease: "power2.out"
});


// about section waves ebb and flow
gsap.to("#top-border > path", {
    duration: 4,
    y: 30,
    stagger: -0.7,
    ease: "sine",
    repeat: -1,
    yoyo: true,
    yoyoEase: "sine",
    repeatDelay: 0.05
});
gsap.to("#bot-border > path", {
    duration: 4,
    y: -30,
    stagger: -0.7,
    ease: "sine",
    repeat: -1,
    yoyo: true,
    yoyoEase: "sine",
    repeatDelay: 0.05,
    delay: 4.05
});