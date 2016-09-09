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
from grovepi import grovepi
from board import Board
#from devices.grovergb import GroveRGB
from devices.grove_flow_sensor import GroveFlowSensor
from devices.sound_sensor import SoundSensor
from devices.temp_sensor import TempSensor
from devices.ultrasonic_ranger import UltraSonicRanger
#from devices.led_bar import GroveLED
from devices.grove_button import GroveButton
from sbs.tools import Tools
from sbs.tools import RGB
from tornado import gen
from random import randint
import time

CYCLE_MESSAGES = 60

# The RaspPi board includes the GrovePi library and reads values from devices connected to a Raspberry Pi.
class RaspPi(Board):

    # Initialize the board and all of the devices attached to the board.
    lastMessage = { 'time':time.time(), 'message':0 }
    def __init__(self, pins, thresholds):
        super(RaspPi,self).__init__(pins, thresholds, "RPi")

        #self.flow_sensor = GroveFlowSensor(self.pins['sensors']['flow-sensor'])
        self.sound_sensor = SoundSensor(self.pins['sensors']['sound-sensor'], self.thresholds['sound'])
        self.temp_sensor = TempSensor(self.pins['sensors']['temp-sensor'], self.thresholds['temp'])
        #self.ultrasonic_ranger = UltraSonicRanger(self.pins['sensors']['ultrasonic-ranger'], self.thresholds['ultrasonic'])
        #self.lcd = GroveRGB()
        self.buttons = {}
        self.leds = {}
        #self.led_bar = GroveLED()
        #self.print_to_screen('IP Address: \n '+Tools.get_ip_address(), [0,128,64])
        time.sleep(10)

    #TODO: Make this section more dynamic, so any sensor can be automatically loaded.

    def read_sound_sensor(self):
        return self.sound_sensor.read()

    def read_temp_sensor(self):
        return "{:4.1f}".format(self.temp_sensor.read())

    # The clear function is run when the application halts.
    def clear(self):
        for led in self.leds:
            self.leds[led].off()
        self.lcd.clear()

    def setHelloSBSScreen(self):
        current_time = time.time();
        if (current_time-self.lastMessage['time']>CYCLE_MESSAGES):
            self.lastMessage['message'] += 1
            if (self.lastMessage['message']==5):
                self.lastMessage['message']=0
            #self.print_to_screen(self.sbs_messages(self.lastMessage['message']),RGB['orange'])
            self.lastMessage['time'] = current_time
        #else:
         #   self.print_to_screen(self.sbs_messages(self.lastMessage['message']),RGB['orange'])

    def reset(self):
        return
        #self.flow_sensor.reset_flow_count()
