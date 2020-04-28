# lambda-cloudwatch-slack
Forked from [here](http://github.com/assertible/lambda-cloudwatch-slack)


## Configuration

### 1. Clone this repository

### 2. Configure environment variables

```
cp .env.example .env
```

Fill in the variables in the `.env`. 

### 3. Setup Slack hook

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


### 4. Deploy to AWS Lambda

The final step is to deploy the integration to AWS Lambda:

    npm install
    npm run deploy

