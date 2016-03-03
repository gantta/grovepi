'''
Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.
'''
<<<<<<< HEAD
from grovepi import grovepi
import time

BLINK_DURATION = 0.25

# LED Bar methods
# grovepi.ledBar_init(pin,orientation)
# grovepi.ledBar_orientation(pin,orientation)
# grovepi.ledBar_setLevel(pin,level)
# grovepi.ledBar_setLed(pin,led,state)
# grovepi.ledBar_toggleLed(pin,led)
# grovepi.ledBar_setBits(pin,state)
# grovepi.ledBar_getBits(pin)

class GroveLED(object):

    def __init__(self, pin):
        # ledbar_init(pin,orientation)
        # orientation: (0 = red to green, 1 = green to red)
        grovepi.pinMode(self.pin, 1)
        
        for i in range(0,11):
            grovepi.ledBar_setLevel(self.pin, i)
            time.sleep(.2) 

    def updateLevel(self, level):
        grovepi.ledBar_setLevel(self.pin, level)

    def off(self):
        grovepi.ledBar_setLevel(self.pin, 0)

=======
from led import LED
from grovepi import grovepi
import time
# Represents an LED on the SBS

BLINK_DURATION = 0.25

class GroveLED(LED):

    #TODO: Implement this class.
    def __init__(self, pin, name):
        super(GroveLED,self).__init__(pin, name)
        grovepi.pinMode(self.pin, "OUTPUT")

    def blink(self):
        grovepi.digitalWrite(self.pin,1)
        time.sleep(BLINK_DURATION)
        grovepi.digitalWrite(self.pin,0)

    def on(self):
        grovepi.digitalWrite(self.pin,1)

    def off(self):
        grovepi.digitalWrite(self.pin,0)
>>>>>>> refs/remotes/origin/master
