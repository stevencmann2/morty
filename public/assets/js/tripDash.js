$(document).ready(function () {
      const breakdownForm = $("#breakdownform");
      const expenseForm = $("#expenseForm");
      expenseBody = $("#expenseBody")

      let totalBudgetValue;
      

      ////////// get trip data for modal 
      function getTrip() {
        const url = window.location.pathname;
        let tripId;
        if (url.indexOf("/") !== -1) {
          tripId = url.split("/")[2];
        }

        $.get(`/api/trips/${tripId}`, function (data) {
          const trip = data
          if (trip) {
            // appending the total budget to the modal
            $("#totalBudget").append(`Total Budget: $ ${trip.totalbudget}`)
            $("#totalBudget").attr("value", trip.totalbudget)
            totalBudgetValue = trip.totalbudget
          }
        })
      };

      getTrip();

      ///// BUDGET MANAGER MODAL SHOW

      $("#budgetManager").click(function () {
        event.preventDefault();
        $("#budgetManagerModal").modal('show');
      });

      ///// BUDGET tracker MODAL SHOW
      $("#budgetTracker").click(function () {
        event.preventDefault();
        $("#budgetTrackerModal").modal('show');
      });

      ///// BUDGET expenses MODAL SHOW
      $("#addExpense").click(function () {
        event.preventDefault();
        $("#ExpensesModal").modal('show');
      });


      //SAVINGS MODAL

      $("#savingsModalshow").click(function () {
        event.preventDefault();
        $("#savingsModal").modal('show');
      })

      // THIS IS FOR THE SELF ADDING FORM FUNCTION CREDIT TO @CODETUBE
      $(".form-group").on('input', '.prc', function () {
        var totalSum = 0;
        $(".form-group .prc").each(function () {
          var inputVal = $(this).val();
          if ($.isNumeric(inputVal)) {
            totalSum += parseFloat(inputVal);
          }
        });

        $('#result').val(totalSum)
      });

      /// HANDLES MODAL SUBMIT FOR BUDGET BREAKDOWN
      $("#budgetManageSave").on("click", function budgetBreakdownSubmit(event) {
        event.preventDefault();
        const resultsTotal = parseInt($('#result').text())

        if (resultsTotal == totalBudgetValue) {
          // grabbing the tripId from the URL
          const url = window.location.pathname;
          var tripId;
          if (url.indexOf("/") !== -1) {
            tripId = url.split("/")[2];
          }

          ///// FORM THE BUDGET MANAGER 'BREAKDOWN' MODAL
          let airfareBudget = $("#airfare").val().trim();
          let transportationBudget = $("#transportation").val().trim();
          let lodgingBudget = $("#lodging").val().trim();
          let foodBudget = $("#food").val().trim();
          let activitiesBudget = $("#activities").val().trim();
          let emergencyBudget = $("#emergency").val().trim();
          let miscBudget = $("#misc").val().trim();

          const initialZeroArray = [airfareBudget, transportationBudget, lodgingBudget, foodBudget,
            activitiesBudget, emergencyBudget, miscBudget
          ]
          let breakdownArray = []
          for (i = 0; i < initialZeroArray.length; i++) {
            if (!initialZeroArray[i]) {
              initialZeroArray[i] = 0
            }
            breakdownArray.push(initialZeroArray[i])
          }

          let dataArray = []
          for (let i = 0; i < breakdownArray.length; i++) {

            let BBdata = {
              description: null,
              amountDesired: parseInt(breakdownArray[i]),
              BudgetCategoryId: parseInt(i + 1),
              TripId: parseInt(tripId)
            }
            dataArray.push(BBdata)
          }

          // Send the POST request.
          $.ajax("/api/budgetbreakdown", {

            type: "POST",
            data: {
              budget: dataArray
            }

          }).then(
            function () {
              // Reload the page to get the updated list
              window.location.reload();
            }
          );

        } else {
          alert('Oops! Your Total Budget does not equal your Desired Budget Cateogries Total, please adjust your calculcations');
        }
      });

      /// ADDING AN EXPENSE
      ///THIS IS FOR POSTING TO THE BUDGET BREAKDOWN 
      $(expenseForm).on("submit", expensetoDb);

      function expensetoDb(event) {

        event.preventDefault();
        //EXPENSE MODAL 
        const expenseAmount = $("#expenseamount");
        const expenseDescription = $("#expensedescription");
        const BBid = $("input[name='categorybutton']:checked").val().trim();
        const Amountvalue = parseInt(expenseAmount.val())

        if (expenseDescription.val().trim() === "") {
          alert("Please fill out the Expense form completley to add an expense")
        } else {

          const url = window.location.pathname;
          var tripId;
          if (url.indexOf("/") !== -1) {
            tripId = url.split("/")[2];
          }

          let newExpense = {
            amount: parseInt(expenseAmount.val().trim()),
            description: expenseDescription.val().trim(),
            BudgetCategoryId: parseInt(BBid),
            TripId: parseInt(tripId)
          }

          $.ajax("/api/expenses", {

            type: "POST",
            data: newExpense

          }).then(
            function () {
              window.location.reload();
            }
          );
        }
      }


      function getExpenses() {

        const url = window.location.pathname;
        let tripId;
        if (url.indexOf("/") !== -1) {
          tripId = url.split("/")[2];
        }

        $.get(`/api/expenses/trips/${tripId}`, function (data) {

          const expenses = data
          console.log(expenses)

          if (!expenses || !expenses.length) {
            displayNoExpenses()
          } else {
            chartExpenses(expenses)
            DiffDisplay(expenses)
          }

        })
      };
      getExpenses();



      function displayNoExpenses() {
        // tripsContainer.empty();
        let H2 = $("<h2>");
        H2.css({
          "text-align": "center",
          "margin-top": "50px"
        });
        H2.html("You dont appear to have any expenses at the moment, click the button below in order to add an expense to your planned trip.");
        expenseBody.append(H2);
      }

      function noBudgetBreakdown() {

        breakdownBody = $("#breakdownBody")
        let H2 = $("<h2>");
        H2.css({
          "text-align": "center",
          "margin-top": "50px"
        });
        H2.html("To begin using Passport, click the button below and enter your desired budget constraints");
        breakdownBody.append(H2);
      };

      function budgetbreakdownGet() {
        const url = window.location.pathname;
        var tripId;
        if (url.indexOf("/") !== -1) {
          tripId = url.split("/")[2];
        }
        $.get(`/api/budgetbreakdown/trips/${tripId}`, function (data) {

          const BBreakdown = data
          // console.log(BBreakdown)

          if (!BBreakdown || !BBreakdown.length) {
            $("#savingsModalshow").hide()
            $("#expenseCard").hide();
            $("#updatebudgetManager").hide();
            noBudgetBreakdown();
            $("#deleteDiv").hide();

          } else {
            $("#savingsModalshow").show()
            $("#deleteDiv").show()
            $("#expenseCard").show();
            $("#budgetManageSave").hide();
            $("#updatebudgetManager").show();
            $("#budgetManager").text('Adjust Budget')
            $("#budgetManager").attr('class', 'btn btn-warning btn-block btn-lg mb-4')
            chartBudget(BBreakdown);
            barCompare(BBreakdown)
          

          }
        })
      }

      budgetbreakdownGet();

      $("#updatebudgetManager").on("click", function BudgetUpdate() {
        event.preventDefault();


        // grabbing the tripId from the URL
        const url = window.location.pathname;
        var tripId;
        if (url.indexOf("/") !== -1) {
          tripId = url.split("/")[2];
        }

        ///// FORM THE BUDGET MANAGER 'BREAKDOWN' MODAL
        const airfareBudget = $("#airfare").val().trim();
        const transportationBudget = $("#transportation").val().trim();
        const lodgingBudget = $("#lodging").val().trim();
        const foodBudget = $("#food").val().trim();
        const activitiesBudget = $("#activities").val().trim();
        const emergencyBudget = $("#emergency").val().trim();
        const miscBudget = $("#misc").val().trim();

        ///// breakdownArray
        const breakdownArray = [airfareBudget, transportationBudget, lodgingBudget,
          foodBudget, activitiesBudget, emergencyBudget, miscBudget
        ];

        let updatedDataArray = []
        for (let i = 0; i < breakdownArray.length; i++) {

          let updatedBBdata = {
            description: null,
            amountDesired: parseInt(breakdownArray[i]),
            BudgetCategoryId: parseInt(i + 1),
            TripId: parseInt(tripId)
          }
          updatedDataArray.push(updatedBBdata)
        }
        // Send the POST request.
        $.ajax(`/api/budgetbreakdown/trips/${tripId}`, {

          type: "PUT",
          data: {
            budget: updatedDataArray
          }

        }).then(
          function () {
            window.location.reload();
          }
        );
      })


      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //CHARTS //////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////////////////////vv///////////////////////////////////////////////v


      function chartBudget(BBreakdown) {
        let totalArray = [];
        for (i = 0; i < BBreakdown.length; i++) {
          totalArray.push(BBreakdown[i].amountDesired)

        }
        //dollarTotalBudget
        const sumTripTotal = totalArray.reduce(function (a, b) {
          return a + b;
        }, 0);

        $('#totalBudgetAmount').append(`<h5>Total Trip Budget: $ ${sumTripTotal}</h5>`)
        $('#breakdownBody').prepend("<canvas id='budgetChart' class='mb-2'></canvas>")
        let chart = $('#budgetChart');
        let budgetChart = new Chart(chart, {
          // The type of chart we want to create
          type: 'doughnut',

          // The data for our dataset
          data: {
            labels: ['Airfare', 'Transportation', 'Lodging',
              'Food and Drink', 'Activities', 'Emergency', 'Miscellanesous'
            ],
            datasets: [{
              label: 'My First dataset',
              //sets the colors of the individual segments of the chart
              backgroundColor: ['rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)'
              ],
              //if you want to add a border between the segments
              // borderColor: 'rgb(255, 99, 200)',
              data: [BBreakdown[0].amountDesired, BBreakdown[1].amountDesired, BBreakdown[2].amountDesired,
                BBreakdown[3].amountDesired, BBreakdown[4].amountDesired, BBreakdown[5].amountDesired,
                BBreakdown[6].amountDesired
              ]
            }]
          },

          // Configuration options go here
          options: {}
        });
      }

  

      function chartExpenses(expenses) {



        let amountArray = [];
        let labelsArray = [];
        for (i = 0; i < expenses.length; i++) {

          amountArray.push(expenses[i].amount)
          labelsArray.push(expenses[i].description)
        }
        //dollarTotalExpenses
        const sumAmounts = amountArray.reduce(function (a, b) {
          return a + b;
        }, 0);


        $('#TotalExpenseAmount').append(`Total Spent: $ ${sumAmounts}`)

        $('#expenseBody').prepend("<canvas id='expensesChart' class='mb-2'></canvas>")

        let echart = $('#expensesChart');
        let expensesChart = new Chart(echart, {
          // The type of chart we want to create
          type: 'doughnut',

          // The data for our dataset
          data: {
            labels: labelsArray,
            datasets: [{
              label: 'data',
              //sets the colors of the individual segments of the chart
              backgroundColor: ['rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)', 'rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)', 'rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)', 'rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)', 'rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)', 'rgb(255, 99, 132)', 'rgb(246, 13, 13)',
                'rgb(13, 246, 13)', 'rgb(13, 13, 246)', 'rgb(13, 246, 246)',
                'rgb(246, 13, 195)', 'rgb(71, 246, 13)'
              ],
              //if you want to add a border between the segments
              // borderColor: 'rgb(255, 99, 200)',
              data: amountArray,
            }]
          },

          // Configuration options go here
          options: {}
        });
      }



      $("#addSavings").on("click", function () {
          event.preventDefault();
          const url = window.location.pathname;
          var tripId;
          if (url.indexOf("/") !== -1) {
            tripId = url.split("/")[2];
          }

          const savingsAmount = parseInt($("#savingsamount").val())
          const savingsCategory = parseInt($("#savingsCategory").val())
          console.log(savingsAmount)
          let savingsData = {
            savings: savingsAmount,
            BudgetCategoryId: savingsCategory
          }

          console.log(tripId)
          $.ajax(`/api/budgetbreakdown/${tripId}`, {

            type: "PUT",
            data: savingsData
            
          }).then(function () {
              // Reload the page to get the updated list
              console.log('THIS WENT THROUGH')
              window.location.reload();
            }

          )
      });




        // ?add click event for button!
        //and hide show in BBreakdown
        $("#deleteTrip").on("click", function deleteTrip() {
          const url = window.location.pathname;
          let tripId;
          if (url.indexOf("/") !== -1) {
            tripId = url.split("/")[2];
          }

          if (confirm("Are you sure you want to delete this trip? Once it is deleted, all of your information will be as well")) {
            $.ajax({
              method: "DELETE",
              url: `/api/trips/${tripId}`
            }).then(

              window.location.href = "/myTrips"

            );
          }


        });


        function DiffDisplay(expenses) {
          //TOTAL
          console.log(totalBudgetValue)

          let totalexpArray = [];
        for (i = 0; i < expenses.length; i++) {
          totalexpArray.push(expenses[i].amount)

        }
        //dollarTotalBudget
        const tripExptotal = totalexpArray.reduce(function (a, b) {
          return a + b;
        }, 0);
        console.log(tripExptotal)
        console.log(totalBudgetValue)
        
         const underbudget = (totalBudgetValue - tripExptotal);
         const overbudget= (tripExptotal - totalBudgetValue);

         console.log(underbudget)
         console.log(overbudget)

        console.log(totalBudgetValue + "total budget val")





        if(tripExptotal >totalBudgetValue){
          $("#diffDisplay").prepend(
           ` <h4>You are $ ${overbudget} over budget!</h4>
          `)
        }
        if (tripExptotal < totalBudgetValue){
          $("#diffDisplay").prepend(
            `<h4>You are $ ${underbudget} under budget!</h4>
          `)
        }
        if (tripExptotal === totalBudgetValue)
        $("#diffDisplay").prepend(`
          <h4>You hit the mark and are righ on budget!</h4>
        `)
        }


        function barCompare(BBreakdown){
          Chart.scaleService.updateScaleDefaults('linear', {
            ticks: {
                min: 0
            }
        });
       const labelsArray = ['Airfare', 'Transportation', 'Lodging',
              'Food and Drink', 'Activities', 'Emergency', 'Miscellanesous']
          console.log(BBreakdown)
          
          let BBset =[]
          let savingsSet =[]
          for(i=0; i< BBreakdown.length; i++){
            if(BBreakdown[i]){
               BBset.push(BBreakdown[i].amountDesired)
               if(BBreakdown[i].savings===null){
                BBreakdown[i].savings = 0;
                savingsSet.push(BBreakdown[i].savings)
               }else{
                savingsSet.push(BBreakdown[i].savings)
        
               }
            }
            
        
          }
        
          $('#barDiv').append(`<canvas id='barChart' class='mb-2 '></canvas>`)
          // $('#CategorybreakdownBody').prepend("<canvas id='CategorybudgetChart' class='mb-2'></canvas>") ///// change this id
          let chart = $(`#barChart`); ///// change thisid

 


          console.log(savingsSet)
          console.log(BBset)
          let categoryChart = new Chart(chart, {
            // The type of chart we want to create
            type: 'bar',
            data: {
              labels: ['Airfare', 'Transportation', 'Lodging',
              'Food and Drink', 'Activities', 'Emergency', 'Miscellanesous'],
              datasets: [{
                label: "Chosen Budget",
                backgroundColor: 'rgb(0, 99, 132)',
                data: BBset
              },{
                label: "Chosen Budget",
                backgroundColor: 'rgb(200, 13, 246)',
                data: savingsSet
              }
            ],
  
              
            },
            options: {
              scales: {
                yAxes: [{
                    ticks: {

                      suggestedMin: totalBudgetValue 
                        // // Include a dollar sign in the ticks
                        // callback: function(value, index, values) {
                        //     return '$' + value;
                        // }
                    }
                }]
            }
            }
            // Configuration options go here
          });
        
    }




      });