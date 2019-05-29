//module pattern with iife
let budgetController = (function() {

	//priavte variables and methods by iife
	let Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round( (this.value / totalIncome)*100) ;
		}else{
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}

	let Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	}

	let calculateTotal = function(type) {
		let sum = 0;
		data.allItems[type].forEach((current) => {
			sum += current.value;
		});

		data.totals[type] = sum;
	}

	let data = {
		allItems: {
			exp: [],
			inc: [],
		},

		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
	};

	//public methods
	return {

		addItem: function(type, des, val) {
			let newItem,ID;

			//create new id
			if( data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}else{
				ID = 0;
			}
			
			//create new item based on type
			if(type === 'exp'){
				newItem = new Expense(ID,des,val);
			}else if (type === 'inc'){
				newItem = new Income(ID,des,val)
			}

			//push to data struct
			data.allItems[type].push(newItem);

			//return new element
			return newItem;
		},

		calculateBudget: function(type) {
			//1. calc total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//2. calc budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			//3. calc percentage of income spent
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
			}else{
				data.percentage = -1;
			}
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},
		deleteItem: function(type, id){
			data.allItems[type] = data.allItems[type].filter( item => item.id !== id );
		},
		calculatePercentages: function(){
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},
		getPercentages: function(){
			let allPercentages = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});

			return allPercentages;
		}
	}
})();




//UI Module
//***********************************************************************
let UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month',
	}

	let formatNumber = function(num, type){
		let numSplit, int, dec; 

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];

		if(int.length > 3){
			int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,int.length);
		}

		dec = numSplit[1];

		type === 'exp'? sign = '-' : sign = '+';

		return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
	}

	let nodeListForEach = function(list, callback){
		for(let i = 0; i < list.length; i++){
			callback(list[i],i);
		}
	}

	return {

		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			}
		},

		getDOMstrings: function() {
			return DOMstrings;
		},

		addListItem: function(obj,type) {
			let html, newHtml, element;

			//create html string with placeholder text
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//replace placeholder with data
			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

			//insert html into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},

		clearFields: function() {
			let fields,  fieldsArray;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach((current, index, array) => {
				current.value = "";
			});
			fieldsArray[0].focus();
		},
		displayBudget: function(obj){
			let type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
			
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		deleteListItem: function(selectorID){
			let element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		displayPercentages: function(percentages){
			let fields;

			fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			let nodeListForEach = function(list, callback){
				for(let i = 0; i < list.length; i++){
					callback(list[i],i);
				}
			}

			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},
		displayDate: function(){
			let now, year, month, months;

			now = new Date();
			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

			year = now.getFullYear();
			month = now.getMonth();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+year;
		},
		changeType: function(){
			let fields = document.querySelectorAll(
				DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
			);

			document.querySelector(DOMstrings.inputButton).classList.toggle('red');

			nodeListForEach(fields,function(current){
				current.classList.toggle('red-focus');
			});

		}
	}
})();




//Controller Module
//**********************************************************************
let controller = (function(budgetCtrl,UICtrl) {

	let setUpEventListeners = function() {
		let DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',(e) => {
			if( e.keyCode === 13 || e.which === 13){
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);

	}

	let updatePercentages = function() {
		let percentages;

		//1. calculate percentages
		budgetCtrl.calculatePercentages();

		//2. read percentages from budget controller
		percentages = budgetCtrl.getPercentages();

		//3. update UI
		UICtrl.displayPercentages(percentages);
	}
	let updateBudget = function() {
		let budget;

		//1. calc budget
		budgetCtrl.calculateBudget();

		//2. return budget
		budget = budgetCtrl.getBudget();

		//3. display budget on UI
		UICtrl.displayBudget(budget);
	}

	let ctrlAddItem = function() {
		let input, newItem;

		//1. get field input data
		input = UICtrl.getInput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			//2. add item to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. add the item to the UI
			UICtrl.addListItem(newItem,input.type);

			//4. clear fields
			UICtrl.clearFields();

			//5. cacl and update budget
			updateBudget();

			//6. calculate and update percentages
			updatePercentages();
		}
	}

	let ctrlDeleteItem = function(event) {
		let itemID, splitID, type, ID;

		//traverse DOM tree
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		//check if ID exists
		if(itemID){
			//UI information
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. Delete item from data structure
			budgetCtrl.deleteItem(type,ID);

			//2. Delete from UI
			UICtrl.deleteListItem(itemID);

			//3. Update UI totals
			updateBudget();

			//4. calculate and update percentages
			updatePercentages();
		}
	}

	return {
		init: function() {
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
			setUpEventListeners();
		}
	}
})(budgetController,UIController);


//******************************************************************************************
controller.init();