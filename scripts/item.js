const list = document.getElementById('list-box');
let listLen = 1;

function AddItem(button) {
    /*
        Adds a new item to the list with default values
        :button - The button that was clicked, makes it invisible
    */
    button.style.display = 'none';
    const newitem = CreateNewItem();
    list.appendChild(newitem);
    RerenderNumbers();
}

function RerenderNumbers() {
    /*
        Goes through the list and sets the numbers to the correct values after updates
    */
    const listLen = ListLength();
    listArray = list.querySelectorAll('.list-item');
    for (let i = 0; i < listLen; i++) {
        const listNumber = listArray[i].querySelector('.list-item-number');
        listNumber.innerHTML = i + 1;
    }
}

function ListLength() {
    /*
        Returns the length of the list
        :return - An integer
    */
   return list.childElementCount;
}

function DeleteItem(listItem) {
    // If the provided element isnt correct find the closest correct one
    if (!listItem.classList.contains('list-item')) {
        listItem = GetListItem(listItem);
    }
    if (listItem == null) {
        ErrorLog('List Item Not Found');
        return null;
    }

    // If there is only one item
    if (ListLength() == 1) {
        return ErrorLog("Cannot delete last item in list");
        
    }

    listItem.remove();

    RerenderNumbers();
}

function ToggleEditing(listItem) {
    /*
        Selects the list item to edit or save
        :listItem - Any html element
    */

    // If the provided element isnt correct find the closest correct one
    if (!listItem.classList.contains('list-item')) {
        listItem = GetListItem(listItem);
    }
    if (listItem == null) {
        ErrorLog('List Item Not Found');
        return null;
    }

    let itemName = listItem.querySelector('.list-item-name');
    let itemDesc = listItem.querySelector('.list-item-desc');
    let deleteButton = listItem.querySelector('.delete-item-button');

    // Switch to editing mode
    if (listItem.dataset.mode == 'normal') {
        itemName.contentEditable = "true";
        itemDesc.contentEditable = "true";
        deleteButton.classList.remove('hidden');
        listItem.dataset.mode = 'editing';
    }

    // Save the item and swtich to normal
    else if (listItem.dataset.mode == 'editing') {
        itemName.contentEditable = "false";
        itemDesc.contentEditable = "false";
        deleteButton.classList.add('hidden');
        listItem.dataset.mode = 'normal';
    }
    Log('\nName: ' + itemName.innerHTML + '\nDesc: ' + itemDesc.innerHTML);
}

function GetListItem(element) {
    /*
        Fetches the list item that this element belongs to
        :element - Any html element
        :returns - If :element belongs to a list item, returns that item
                - If :element does not belong to a list item, returns null
    */

    let elementParent = element.closest('.list-item');

    if (elementParent == null) {
        return null;
    }
    else {
        return elementParent;
    }
}

function CreateNewItem() {
    /*
        Creates a new item element with default values
        :return - Returns the created element
    */
    let newItem = document.createElement('div');

    newItem.innerHTML = listItemTemplate;

    return newItem;
    }



const listItemTemplate = `
<div class="list-item flex-col" data-mode="normal">

    <!-- Top of item box-->
    <div class="list-item-top-box flex-row">
        <div class="list-item-top-left-box flex full-center">
            <button class="item-button list-item-number full-center flex" onclick="ToggleEditing(this)">#</button>
        </div>

        <div class="list-item-top-right-box left-center-text">
            <h1 class="list-item-name " contenteditable="false">Name</h1>
            <button class="delete-item-button hidden" onclick="DeleteItem(this)">Delete Item</button>
        </div>
    </div>

    <!-- Bottom of item box -->
    <div class="list-item-bot-box flex-row">
        <div class="list-item-bot-left-box full-center flex">
            <button class="new-item-button plus-icon full-center flex" contenteditable="false" onclick="AddItem(this)">
            </button>
        </div>

        <div class="list-item-bot-right-box">
            <p class="list-item-desc">Description goes here</p>
        </div>
    </div>
    
</div>
`;