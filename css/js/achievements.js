document.addEventListener("DOMContentLoaded", function () {
  const projectsCompleted = document.getElementById("projectsCompleted");
  const totalTasks = document.getElementById("totalTasks");
  const cupsOfCoffee = document.getElementById("cupsOfCoffee");

  let projectCount = 52;
  let tasksCount = 1161;
  let coffeeCount = 2290;

  // Update the counters every 5 seconds
  setInterval(function () {
      projectCount++;
      tasksCount++;
      coffeeCount++;

      // Update the displayed counts
      projectsCompleted.innerText = projectCount;
      totalTasks.innerText = tasksCount;
      cupsOfCoffee.innerText = coffeeCount;
  }, 5000);
});
