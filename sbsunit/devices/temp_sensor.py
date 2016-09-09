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
from grove_sensor import GroveSensor

DEFAULT_THRESHOLD = 74

class TempSensor(GroveSensor):

    isClose = False
    threshold = DEFAULT_THRESHOLD

    def __init__(self, pin, threshold):
        super(TempSensor, self).__init__(pin,"Temp Sensor")
        self.threshold = threshold
        grovepi.pinMode(self.pin,"INPUT")

    def read(self):
        #return grovepi.analogRead(self.pin)
        return grovepi.temp(self.pin, '1.1')*9/5+32

    # Checks if the current reading is below the threshold for cold. If it is, it returns True
    def is_cold(self):
        if self.read() < self.threshold:
            return True
        else:
            return False
