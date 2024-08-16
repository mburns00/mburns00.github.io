document.addEventListener("DOMContentLoaded", function () {
    const introOverlay = document.querySelector(".intro-overlay");
    const loadingOverlay = document.querySelector(".loading-overlay");
    const mainSection = document.querySelector(".main");
    const nav = document.querySelector("nav");

    // Event listener for the intro overlay click
    introOverlay.addEventListener("click", () => {
        console.log("Intro overlay clicked.");
        // Hide the intro overlay
        if (introOverlay) introOverlay.style.display = "none";
        // Show the loading overlay
        if (loadingOverlay) loadingOverlay.style.display = "flex";

        // Wait for 1 second before transitioning to the main section and nav
        setTimeout(() => {
            setTimeout(() => {
                // Hide the loading overlay
                if (loadingOverlay) loadingOverlay.style.display = "none";
                // Display the navigation bar
                if (nav) nav.style.display = "block";
                // Display the main section
                if (mainSection) mainSection.style.display = "flex";
                console.log("Main section and nav displayed.");
                // Scroll to the top of the page
                window.scrollTo(0, 0);
            }, 1340); // Ensure this matches the timing of the thud sound
        }, 1000); // Time for loading screen to be visible
    });
});
