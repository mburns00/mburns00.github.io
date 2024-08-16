document.addEventListener("DOMContentLoaded", function () {
  const clickAudio = new Audio("sound/click.mp3");
  clickAudio.volume = 0.8; // Adjusted volume

  const bodyAudio = new Audio("sound/mainpage.mp3");
  bodyAudio.volume = 0.4; // Adjusted volume
  bodyAudio.loop = true;

  const introOverlay = document.querySelector(".intro-overlay");
  const loadingScreen = document.getElementById("loadingScreen");
  const mainSections = document.querySelectorAll(".main, nav");

  // Play click sound on click
  document.addEventListener("click", function () {
      clickAudio.currentTime = 0;
      clickAudio.play();
  });

  // Handle intro overlay click
  introOverlay.addEventListener("click", () => {
      //const introAudio = new Audio("sound/intro-overlay.mp3");
      //introAudio.volume = 0.8;
      //introAudio.play();

      introOverlay.style.display = "none";
      loadingScreen.style.display = "block";

      const staticAudio = new Audio("sound/static.mp3");
      staticAudio.play();

      setTimeout(() => {
          loadingScreen.style.opacity = 0;
          staticAudio.volume = 0.2;

          setTimeout(() => {
              loadingScreen.style.display = "none";
              mainSections.forEach(section => section.style.display = "block");
              bodyAudio.play();
          }, 2000); // Ensure this matches the duration of the fade-out effect
      }, 1000); // Duration to keep loading screen visible before fading out
  });

  // Handle number-card click for animation
  document.querySelectorAll(".number-card").forEach(card => {
      card.addEventListener("click", function () {
          const gif = document.createElement("img");
          gif.src = "images/matrixcode.gif";
          gif.style.width = "100%";
          gif.style.height = "100%";
          gif.style.position = "absolute";
          gif.style.top = "0";
          gif.style.left = "0";
          gif.style.zIndex = "10";
          this.appendChild(gif);

          const achievementText = this.querySelector("p");
          achievementText.style.display = "none";

          setTimeout(() => {
              const disconnectedText = document.createElement("p");
              disconnectedText.innerText = "disconnected...";
              disconnectedText.style.color = "#00ff00";
              disconnectedText.style.fontSize = "20px";
              disconnectedText.style.textAlign = "center";
              disconnectedText.style.position = "absolute";
              disconnectedText.style.top = "50%";
              disconnectedText.style.left = "50%";
              disconnectedText.style.transform = "translate(-50%, -50%)";
              disconnectedText.style.zIndex = "20";
              disconnectedText.classList.add("disconnected-text");
              this.appendChild(disconnectedText);

              setTimeout(() => {
                  this.querySelector("img").remove();
                  disconnectedText.remove();
                  achievementText.style.display = "block";
              }, 3000); // Display disconnected text for 3 seconds
          }, 3000); // Delay for gif duration before showing disconnected text
      });
  });
});
