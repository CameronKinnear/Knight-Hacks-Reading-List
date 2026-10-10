let disableOutputs = false;

function Log(text) {
    /*
    Prints a message to the console labeled DEBUG LOG
    :text - A string that will be printed to the console
    */
    if (disableOutputs == true) {
        return;
    }
    console.log('DEBUG LOG: ' + text);
}

function ErrorLog(text) {
    /*
    Prints a message to the console labeled ERROR
    :text - A string that will be printed to the console
    */
    if (disableOutputs == true) {
        return;
    }
    console.log('ERROR: ' + text);
}