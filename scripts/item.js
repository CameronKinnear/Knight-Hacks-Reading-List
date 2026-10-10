const list = document.getElementById('list-box');


function AddItem(button) {
    /*
        Adds a new item to the list with default values
        :button - The button that was clicked, makes it invisible
    */
   button.style.display = 'none';
   const newitem = CreateNewItem();
   list.appendChild(newitem);
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

    // Switch to editing mode
    if (listItem.dataset.mode == 'normal') {
        itemName.contentEditable = "true";
        itemDesc.contentEditable = "true";
        listItem.dataset.mode = 'editing';
    }

    // Save the item and swtich to normal
    else if (listItem.dataset.mode == 'editing') {
        itemName.contentEditable = "false";
        itemDesc.contentEditable = "false";
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
        </div>
    </div>

    <!-- Bottom of item box -->
    <div class="list-item-bot-box flex-row">
        <div class="list-item-bot-left-box full-center flex">
            <button class="new-item-button plus-icon" contenteditable="false" onclick="AddItem(this)"></button>
        </div>

        <div class="list-item-bot-right-box">
            <p class="list-item-desc">Description goes here</p>
        </div>
    </div>
    
</div>
`;