# lambda-cloudwatch-slack
Forked from [here](http://github.com/assertible/lambda-cloudwatch-slack)


## Configuration

### 1. Clone this repository

### 2. Setup Slack hook (one for each environment / application)

Follow these steps to configure the webhook in Slack:

  1. Navigate to
     [https://slack.com/services/new](https://slack.com/services/new)
     and search for and select "Incoming WebHooks".

  3. Choose the default channel where messages will be sent and click
     "Add Incoming WebHooks Integration".

  4. Copy the webhook URL from the setup instructions and use it in
     the next section.

  5. Click 'Save Settings' at the bottom of the Slack integration
     page.

### 3. Configure environment variables

```
cp .env.example .env
```

Fill in the variables in the `.env`.

Note:
1. The name that you configure for this function. It should indicate the environment / service it pertains to.
1. The environment in the name should match the environment of the webhook that is configured.

### 4. Deploy to AWS Lambda

Deploy the integration to AWS Lambda:

    npm install
    npm run deploy
    
### 5. Create Lambda Subscription Filter in CloudWatch

In step 4 we created a Lambda function in AWS that will send to the Slack webhook configured in step 3. 

Now we need to configure CloudWatch to send error logs to this Lambda function.

1. Go to `Log Groups` within CloudWatch
1. Find the log group(s) that may contain error logs that should be sent to slack
1. Select the log group and select `Actions -> Create Lambda Subscription Filter`
1. In the Create Subscription Filter dialog
    1. Select the Lambda function that corresponds to the Log group (dev to dev, uat to uat, etc.)
    1. Select the Log format. I usually go with `AWS CloudTrail`, but you can choose different ones and see the format example below
    1. Create a log pattern for which matches should be sent to slack (See existing ones by using `aws logs describe-subscription-filters --log-group-name <log group>` aws-cli command
    1. Test out the pattern on data that you enter in the sample logs text area
    1. Finalize the creation of the subscription filter.
1. Test that errors logged are sent to slack


