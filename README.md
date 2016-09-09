GrovePi Simple Sensors Setup Guide
=======================================================

Inspired by Amazon's Simple Beer Service project [link](https://github.com/awslabs/simplebeerservice)

Simple Sensors is a cloud-connected Raspberry Pi that sends sensor data (temperature, humidity, sound levels and proximity) to an Amazon API Gateway endpoint. The API Gateway endpoint invokes an AWS Lambda function that writes sensor data to an Amazon DynamoDB table. A serverless static S3 website displays the data in real-time as it streams in through Amazon API Gateway and AWS Lambda.

SBS Device Architecture
-----------------
![](rasppi-device-architecture.png?raw=true)

Real-time Dashboard Architecture
-----------------
![](web-architecture.png?raw=true)

Pre-requisites
==================

Hardware
-----------------
Before getting started, check to ensure you have the following components:

* Raspberry Pi -  [Purchase](http://www.amazon.com/Raspberry-Pi-Model-Project-Board/dp/B00T2U7R7I/ref=sr_1_2?s=pc&ie=UTF8&qid=1443486305&sr=1-2&keywords=Raspberry+Pi)
* GrovePi Shield - [Purchase](http://www.amazon.com/Seeedstudio-GrovePi/dp/B012TNLD10/ref=sr_1_2?s=pc&ie=UTF8&qid=1443486442&sr=1-2&keywords=GrovePi)
* Seeed Studio: Flow Meter, DHT PRO, Ultrasonic Sensor, Button, 3 LEDS, Speakers and whatever else you want!
[More Info](http://www.seeedstudio.com/wiki/Grove_System)

Getting your AWS environment up and running.
==================

1. Purchase a domain for your website and create a new hosted zone associated with the domain.
2. Launch the CloudFormation script include in the **cfn/** directory. Reference the hosted zone used in Step 1.
3. Once completed, in the outputs of your CloudFormation stack, you will see the name of two DynamoDB tables. One, is the unit table used to hold the information about all SBS units in your fleet. The other, is the SBS data table. All sensor data from your SBS fleet is written into this table. Secondly, you will see the name of the three lambda functions in here as well. We will reference these names in the application files.
4. In the SBS code base, you will need to change a few things:
  - *deploy/lambda.sh* -> replace the FCT_NAMES with the actual Lambda function names from the outputs above.
  - *web/Gruntfile.js* -> find the task "publish" and replace with <S3_BUCKET> with your bucket name. Also, change the IAM profile from default to your profile name if required, as well as the default region.
  - *lambda/getSBSFleet, lambda/readSBSData, lambda/writeSBSData* -> Add in your DynamoDB table names to these files.
5. Deploy your lambda functions using the script **/deploy/lambda.sh**. Note: The deploy script relies on AWS CLI [Install](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
6. Next, create a new API Gateway endpoint and wire up the Lambda functions.
  - *ENDPOINT/data* -> GET -> Query String Parameters (timestamp) -> readSBSData lambda function.
  - *ENDPOINT/fleet* -> GET -> getSBSFleet lambda function.
  - *ENDPOINT/{sbsid}* -> GET -> getSBSFleet lambda function.
  - *ENDPOINT/{sbsid}/data* -> GET -> Query String Parameters (timestamp) -> readSBSData lambda function.
  - *ENDPOINT/{sbsid}/data* -> POST -> writeSBSData lambda function.
  - For the resources that require the query string parameter timestamp, include the following Mapping Template in the integration response:application/json -> **{ "timestamp": "$input.params('timestamp')" }**
  - For more information on how to setup API Gateway and wire them up to Amazon API Gateway, [click here](https://aws.amazon.com/blogs/compute/the-squirrelbin-architecture-a-serverless-microservice-using-aws-lambda/)
  - You will also need to enable CORS support for API Gateway, to do this [click here](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
7. Once completed, take your deployed API Gateway endpoint and add it the following file. You will also need to reference this when installing the device code.
  - *web/app/scripts/main.js*

Software
==================

Flashing the Raspberry Pi with Raspbian
------------------

1. Follow the instructions on the Raspberry Pi website to flash a new SD card with **Raspbian** [1].
2. Once complete, put the SD card into the Raspberry Pi, connect the ethernet cable, external monitor and keyboard.
3. Start the Rasberry Pi. After following the instructions above, you should see a command prompt.

Installing the software
------------------

1. Update the OS:

		sudo apt-get install rpi-update
		sudo rpi-update
		sudo apt-get upgrade
		sudo reboot

2. Configure the linux distribution:

		sudo dpkg-reconfigure keyboard-configuration
		sudo dpkg-reconfigure tzdata
		sudo apt-get update
		sudo reboot

3. Copy over SBS files to the Raspberry-Pi. A recommended directory to install SBS is:

        sudo su
        cd /opt/
        mkdir sbs

4. Run the install script from the SBS directory:

        sudo ./install.sh

5. During the install process, you will be prompted for some configuration variables. You will need to input:
	- A Gateway ID: The identifier of your new SBS unit.
	- An AWS API Gateway Endpoint.
	- An AWS API Gateway Key.
	- The content type (default is application/json)
	- The location of the sensors. For example, flow-sensor = 5 would mean that the flow sensor is connected to D5 on the GrovePi sheild. You can connect your sound sensor to A0 and your RGB LCD screen to any I2C port.
  - The location of the LEDS.
	- The location of the button.
	- Threshold values. You can leave these as the default values.

6. Once your Raspberry Pi has restarted, go back to your install directory and install grove through pip:

        cd /opt/sbs/
        sudo pip install grovepi

7. Set-up WiFi

	a. Open the WPA Supplicant File:

		sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

	b. Add the following to the supplicant file (using the connection details of your WiFi network):

		network={
		ssid="YOURSSID"
		psk="YOURPASSWORD"

		# Protocol type can be: RSN (for WP2) and WPA (for WPA1)
		proto=WPA

		# Key management type can be: WPA-PSK or WPA-EAP (Pre-Shared or Enterprise)
		key_mgmt=WPA-PSK

		# Pairwise can be CCMP or TKIP (for WPA2 or WPA1)
		pairwise=TKIP

		#Authorization option should be OPEN for both WPA1/WPA2 (in less commonly used are SHARED and LEAP)
		auth_alg=OPEN
		}

	c. Open the network interfaces file:

		sudo nano /etc/network/interfaces

	d. Add the following (or replace if it is already there):

		allow-hotplug wlan0
		iface wlan0 inet dhcp
		wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
		iface default inet dhcp

7. Run python SBS.py to start the application.
    Note: python SBS.py --debug to see additional console debug information about your sensor data and payload information.

Troubleshooting
==================

1. Console output error message when making the post request:
    {"errorMessage":"Cannot find module 'index'","errorType":"Error","stackTrace":["Function.Module._resolveFilename (module.js:338:15)"

  - I found this issue was related to the way the lambda folders were zipped and uploaded to AWS. The zip file should include only the contents of the associated lambda folders, not the folder itself.
  - I fixed this issue by zipping the index.js and supporting subfolder from the three subfolders under the lambda folder and manually uploaded the zip files to the respective lambda functions.

2. Console output error message: 
    "errorMessage":"Process exited before completing request"
  - This guy turned out to be a bit more omnimous to troubleshoot. There are a number of different suggestions on forums of troubleshooting this response message, but I found the issue buried in the lambda output logs.
  - Since I was getting successfull post responses, the lambda function logs were providing me information about js functions unable to convert toString for undefined variables. 
  - After adding a few more console output writes to the log, I was able to determine the sbsid variable was not getting passed in the event payload.
  - Making some rudimentary updates to the reader class, I added the SBSID to the post payload and was able to finally get succesful writes to the dynamoDB table.


References
==================

[1] [Raspberry Pi Flashing Guide](http://www.raspberrypi.org/documentation/installation/installing-images/README.md)

