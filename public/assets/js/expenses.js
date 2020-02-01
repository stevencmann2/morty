$(document).ready(function () {
    console.log("expenses javscript loaded")
    function loadExpenses() {
        const url = window.location.pathname;
        var tripId;
        if (url.indexOf("/") !== -1) {
            tripId = url.split("/")[2];
            console.log('here')
        
        $.get(`/api/expenses/trips/${tripId}`, function (data) {
            console.log('inside ajax')
            const expenses = data
            if(!expenses){
                
                  $("#expensesList").append(
                    `<h2> You dont appear to have any trips
                    yet for this trip please click <a href='/tripDash/${tripId}'>here</a> to navigate
                    back to your Trip Dashboard
                    </h2> ` 
                    ///////
                    //////
                    // expenseschart()
                  )
            }else{
                $("#expensesList").append(
                    `<h2> WORKING
                    </h2> ` 
                  )
                  
            }

        })
    }
    }
    loadExpenses()

});