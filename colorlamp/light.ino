/*
Adapted from the Particle Internet Button Release Firmware by jenesaisdiq
https://github.com/spark/internetbutton
*/

#include "InternetButton.h"
#include "math.h"

// Set up lots of global variables that we'll be using
InternetButton b = InternetButton();
uint8_t button1 = 0;
uint8_t button2 = 0;
uint8_t button3 = 0;
uint8_t button4 = 0;
uint8_t buttonAll = 0;

float ledPos = 1;
float ledDesired = 3;
uint8_t ledPosAchieved = 0;

// Prototypes of the functions that we'll use
int rainbowRemote(String command);
int ledOnRemote(String command);
int ledOffRemote(String command);
int ledAllOnRemote(String command);
int ledAllOffRemote(String command);

void setup() {
    // Starting InternetButton b
    b.begin();

    // Turn all the LEDs on, format is "RED_INT,GREEN_INT,BLUE_INT"
    Particle.function("colorme", ledAllOnRemote);

    // Turn all the LEDs off. Doesn't take any arguments. Or any of your lip.
    Particle.function("allLedsOff", ledAllOffRemote);

    // Woooo rainbows! Just tell it how many seconds.
    Particle.function("rainbow", rainbowRemote);

}

void loop() {
    //nothing to do here
}

void ledControl(int ledn){
    b.ledOn(ledn,60,60,60);
    delay(200);
    ledDesired = ledn;
    if(ledPos < ledDesired){ledDesired++;}
    else{ledDesired--;}
    ledPosAchieved = 0;
}

int rainbowRemote(String command){
    char inputStr[10];
    command.toCharArray(inputStr,10);
    int i = atoi(inputStr);
    long startMillis = millis();
    while(millis() < startMillis + i*1000){
        b.rainbow(30);
    }
    return 1;
}


int ledOnRemote(String command){
    int i = 0;

    char inputStr[20];
    command.toCharArray(inputStr,20);
    char *p = strtok(inputStr,",");
    i = atoi(p);
    p = strtok(NULL,",");
    if(String(p).equals("red")){
        b.ledOn(i,150,0,0);
    }
    else if(String(p).equals("orange")){
        b.ledOn(i,150,75,0);
    }
    else if(String(p).equals("yellow")){
        b.ledOn(i,150,150,0);
    }
    else if(String(p).equals("green")){
        b.ledOn(i,0,150,0);
    }
    else if(String(p).equals("blue")){
        b.ledOn(i,0,0,150);
    }
    else if(String(p).equals("purple")){
        b.ledOn(i,150,0,150);
    }
    else if(String(p).equals("white")){
        b.ledOn(i,150,150,150);
    }
    else {
        //parse out CSV colors

        uint8_t red = atoi(p);
        p = strtok(NULL,",");
        uint8_t grn = atoi(p);
        p = strtok(NULL,",");
        uint8_t blu = atoi(p);

        b.ledOn(i,red,grn,blu);
    }
    return 1;
}

int ledOffRemote(String command){
    char inputStr[10];
    command.toCharArray(inputStr,10);
    char *p = strtok(inputStr,",");
    int i = atoi(p);
    b.ledOff(i);
    return 1;
}

int ledAllOnRemote(String command){
    b.playSong("C4,8,F4,8");
    if(command.equals("red")){
        b.allLedsOn(150,0,0);
    }
    else if(command.equals("orange")){
        b.allLedsOn(150,75,0);
    }
    else if(command.equals("yellow")){
        b.allLedsOn(150,150,0);
    }
    else if(command.equals("green")){
        b.allLedsOn(0,150,0);
    }
    else if(command.equals("blue")){
        b.allLedsOn(0,0,150);
    }
    else if(command.equals("purple")){
        b.allLedsOn(150,0,150);
    }
    else if(command.equals("white")){
        b.allLedsOn(150,150,150);
    }
    else if(command.equals("rainbow") || command.equals(":rainbow:")){
        b.rainbow(30);
    }
    else if(command.equals("off")){
        b.allLedsOff();
    }
    else {

        char inputStr[20];
        command.toCharArray(inputStr,20);
        char *p = strtok(inputStr,",");
        int red = atoi(p);
        p = strtok(NULL,",");
        int grn = atoi(p);
        p = strtok(NULL,",");
        int blu = atoi(p);
        p = strtok(NULL,",");
        b.allLedsOn(red,grn,blu);
    }
    return 1;
}


// Turn all the LEDs off!
int ledAllOffRemote(String command){
    b.allLedsOff();
    return 1;
}
