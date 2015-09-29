
var UI = require('ui');
var ajax = require('ajax');

// Fetches the HTML of the website containing the menu
function fetchHTML(URL) {
  var html;
  
  ajax({
    url: URL,
    async: false, // Used to make ajax finish before creating meal menu
    type: 'string' // Readable format
  },
  function(data) {
    // Success!
    //console.log('Successfully fetched the menu!');
    html = data;
  },
  function(error) {
    // Failure!
    //console.log('Failed to get the menu listings');
    html = "";
  });
  
  return html;
}

// List of Dining courts at Purdue
var courts = [
  {
    title: "Earhart"
  }, {
    title: "Ford"
  }, {
    title: "Hillenbrand"
  }, {
    title: "Wiley"
  }, {
    title: "Windsor"
  }
];

// Menu containing list of dining courts
var main = new UI.Menu({
  sections: [{
    title: 'Dining Courts',
    items: courts
  }]
});

// Event occurs when user selects a court
main.on('select', function(e) {
  var menuURL = "http://www.housing.purdue.edu/Menus/"; // URL of website containing the menu HTML
  var numMeals; // # of Breakfast, lunch, (late lunch), Dinner
  var meals;
  
  // Sets the URL and number of meals depending on the court selected
  switch (e.item.title) {
    case "Earhart":
      menuURL += "ERHT";
      numMeals = 3;
      break;
    case "Ford":
      menuURL += "FORD";
      numMeals = 4;
      break;
    case "Hillenbrand":
      menuURL += "HILL";
      numMeals = 3;
      break;
    case "Wiley":
      menuURL += "WILY";
      numMeals = 3;
      break;
    case "Windsor":
      menuURL += "WIND";
      numMeals = 4;
      break;
  }
  
  
  // Creates a list of meals with late lunch or not with late lunch
  var day = new Date().getDay();
  
  // On Saturday and Sunday Ford and Windsor only have 3 meals. Checks and sets that here
  if (numMeals == 3 || day === 0 || day == 6) {
    numMeals = 3;
    meals = [
      {
        title: "Breakfast"
      }, {
        title: "Lunch"
      }, {
        title: "Dinner"
      }
    ];
  } else {
    meals = [
      {
        title: "Breakfast"
      }, {
        title: "Lunch"
      }, {
        title: "Late Lunch"
      }, {
        title: "Dinner"
      }
    ];
  }
  
  // Fetches the menu for the given meal
  var menuHTML = fetchHTML(menuURL);
  
  // Checks if the fetcher was unable to get the html
  if (menuHTML === "")
    return;
  
  // console.log(menuHTML);
  
  // Initalize variables for meal start position, meal end position, string containing meal hours and an array containing the list of meals
  var mealStartPos = 0, mealEndPos = 0;
  var mealHours = "";
  var mealItems = [numMeals];
  
  // Iterates through the list of meals and finds if that meal is serving food or not
  for (var i = 0; i < numMeals; i++) {
    mealStartPos = menuHTML.indexOf("location-meal-container", mealStartPos); // Gets the position of the current meal
    mealEndPos = menuHTML.indexOf("/table", mealStartPos); // Gets the stoping position of the current meal
    mealHours = menuHTML.substring(mealStartPos, mealEndPos); // Gets the content of the current meal
    
    mealItems[i] = mealHours; // Sets meal in array for later
    
    //console.log(mealHours);
    
    // Checks if the court is not serving
    if (mealHours.indexOf("Not Serving") < 0) {
      //console.log("court " + i + " is serving");
    }
    else {
      //console.log("court " + i + " is not serving");
      meals[i].title += " (NS)";
    }
    
    mealStartPos++;
  }
  
  // Menu containing the list of meals
  var court = new UI.Menu({
    sections: [{
      title: e.item.title,
      items: meals
    }]
  });
  
  // Event occurs when user selects a meal
  court.on('select', function(e) {
    
    // Checks if the court is not serving
    if (e.item.title.indexOf("(NS)") >= 0)
      return;
    
    // Initalize variables for current meals html, meal start position, meal start position, current meal, and final output
    var currentMealHTML = mealItems[e.itemIndex];
    var currentMealStartIndex = 0, currentMealEndIndex;
    var currentMeal, mealOutput = "";
    
    // Loop to get list of items on menu
    while (true) {
      currentMealStartIndex = currentMealHTML.indexOf("><span>", currentMealStartIndex); // Gets the starting position of the current meal
      currentMealEndIndex = currentMealHTML.indexOf("</", currentMealStartIndex); // Gets the ending position of the current meal
      
      if (currentMealStartIndex != -1) { // Checks if there are no more meals
        currentMeal = currentMealHTML.substring(currentMealStartIndex + 7, currentMealEndIndex); // Gets the current meal
        mealOutput += ("- " + currentMeal + "\n"); // Adds current meal to the list of meals
      } else {
        break;
      }
      
      currentMealStartIndex++;
    }
    
    //console.log(mealOutput);
    
    // Card containing the list of meals
    var fList = new UI.Card({
      title: e.item.title,
      scrollable: true,
      style: "small",
      body: mealOutput
    });
    
    fList.show();
  });
  
  court.show();
});

main.show();
