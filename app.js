//BUDGET CONTROLLER
const budgetController = (function () {

    //function Constructor to store values

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //function to calculate
    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    //structure of our DATA
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {

            //decalere the new constialbes 
            let newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            //create new ITEM
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);

            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //push that item
            data.allItems[type].push(newItem);

            //return the new element.
            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: () => {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentage: () => {
            let allPerc;

            allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;


        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: () => {
            console.log(data);

        }
    };

})();



//UI CONTROLLER
const uiController = (function () {

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateBudgetLabel: '.budget__title--month'

    }

    const formatNumber = (num, type) => {
        let numSplit, int, dec;

        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3 && int.length <= 6) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } else if (int.length > 6 && int.length <= 9) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
        } else if (int.length > 9) {
            int = int.substr(0, int.length - 9) + ',' + int.substr(int.length - 9, 3) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
        }


        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    const nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);

        }
    };

    return {
        getInput: () => {

            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be income or expenses
                description: document.querySelector(DOMStrings.inputDescription).value, //get description
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) // get value
            }


        },

        addListemItem: (obj, type) => {
            let html, newHtml, element;
            // Create HTML Strings with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__date" id="date">%date%</div><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__date" id="date">%date%</div><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            };

            // Replace the placeholder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%date%', uiController.displayDate());

            //Insert HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: (selectorID) => {
            let el;

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
                current.inputDescription = " ";
            });

            fieldsArr[0].focus();

        },

        displayBudget: (obj) => {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: (percentages) => {
            let fields;

            fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else current.textContent = '---';

            });

        },

        displayDate: () => {
            let today, dd, mm, year, month, months;

            today = new Date();
            dd = String(today.getDate()).padStart(2, '0');
            mm = String(today.getMonth() + 1).padStart(2, '0');

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = today.getMonth();
            year = today.getFullYear();

            document.querySelector(DOMStrings.dateBudgetLabel).textContent = months[month] + ' ' + year;

            today = mm + '/' + dd + ' | ';
            return today;
        },

        changedType: () => {
            let fields;

            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: () => {
            return DOMStrings;
        }
    }

})();


//GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {

    const DOM = UICtrl.getDOMStrings();

    const setupEventListeners = () => {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();

            }

        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    const updateBudget = () => {

        //1. Calculate the budget.
        budgetCtrl.calculateBudget();
        //2. Return the budget
        const budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI.
        UICtrl.displayBudget(budget);

    };

    const updatePercentages = () => {

        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read them from budget controller
        const percentages = budgetCtrl.getPercentage();
        //update the user interface
        UICtrl.displayPercentages(percentages);



    };

    const ctrlAddItem = () => {
        let input, newItem;

        //1. Get the field input data.
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //Remove class required when all input are filled.
            document.querySelector(DOM.inputValue).classList.remove('input__required');
            document.querySelector(DOM.inputDescription).classList.remove('input__required');

            //3. Add the new item to the user interface.
            UICtrl.addListemItem(newItem, input.type);

            //4. Clear the fields.
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

        } else if (isNaN(input.value) || input.value <= 0) {
            //add class required to value if empty
            document.querySelector(DOM.inputValue).classList.add('input__required');

        } else if (input.description === "") {
            //add class required to description if empty
            document.querySelector(DOM.inputDescription).classList.add('input__required');
        }



    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1 delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2 delete the item from UI
            UICtrl.deleteListItem(itemID);
            //3 update and show the new budget
            updateBudget();

            //4 update and show new percentages
            updatePercentages();


        }

    }

    return {
        init: () => {
            console.log('App has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }


})(budgetController, uiController)

controller.init();