
var UI = require('ui');
var ajax = require('ajax');

// Fetches the HTML of the website containing the menu
function fetchHTML(URL) {
  var html;
  
  ajax({
    url: URL,
    async: false,
    type: 'string'
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

var main = new UI.Menu({
  sections: [{
    title: 'Dining Courts',
    items: courts
  }]
});

main.on('select', function(e) {
  var menuURL = "http://www.housing.purdue.edu/Menus/";
  var numMeals;
  var meals;
  
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
    
  var menuHTML = fetchHTML(menuURL);
  
  // console.log(menuHTML);
  // TO-DO Extract data from HTML
  
  // Initalize variables for meal start position, meal end position and string containing meal hours
  var mealStartPos = 0, mealEndPos = 0;
  var mealHours = "";
  var mealItems = [numMeals];
  
  for (var i = 0; i < numMeals; i++) {
    mealStartPos = menuHTML.indexOf("location-meal-container", mealStartPos); // Gets the position of the current meal
    mealEndPos = menuHTML.indexOf("/table", mealStartPos); // Gets the stoping position of the current meal
    mealHours = menuHTML.substring(mealStartPos, mealEndPos);
    
    mealItems[i] = mealHours;
    
    //console.log(mealHours);
    
    if (mealHours.indexOf("Not Serving") < 0) {
      //console.log("court " + i + " is serving");
    }
    else {
      //console.log("court " + i + " is not serving");
      meals[i].title += " (NS)";
    }
    
    mealStartPos++;
  }
  
  // To-DO Export data to new card
  var court = new UI.Menu({
    sections: [{
      title: e.item.title,
      items: meals
    }]
  });
  
  court.on('select', function(e) {
    if (e.item.title.indexOf("(NS)") >= 0)
      return;
    
    var currentMealHTML = mealItems[e.itemIndex];
    var currentMealStartIndex = 0, currentMealEndIndex;
    var currentMeal, mealOutput = "";
    
    while (true) {
      currentMealStartIndex = currentMealHTML.indexOf("><span>", currentMealStartIndex);
      currentMealEndIndex = currentMealHTML.indexOf("</", currentMealStartIndex);
      
      if (currentMealStartIndex != -1) {
        currentMeal = currentMealHTML.substring(currentMealStartIndex + 7, currentMealEndIndex);
        mealOutput += ("- " + currentMeal + "\n");
      } else {
        break;
      }
      
      currentMealStartIndex++;
    }
    
    console.log(mealOutput);
    
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
