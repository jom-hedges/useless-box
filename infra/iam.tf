data "aws_iam_policy_document" "useless-box" {
  # ----------------------------------------------
  # DynamoDB - read on init, write on state change
  #-----------------------------------------------
  statement {
    sid     = "DynamoDBStateAccess"
    effect  = "Allow"
    actions = [
      "dynamodb:GetItem",       # init check
      "dynamodb:PutItem",       # write state change
      "dynamodb:UpdateItem",    # flip state back OFF
    ]
    resources = [
      aws_dynamodb_table.useless_box.arn
    ]
  }

  # ---------------------------------------------
  # SNS - notify user on state change 
  # ---------------------------------------------
  statement {
    sid = "SNSPublish"
    effect = "Allow"
    actions = [
      "sns:Publish",
    ]
    resources = [
      aws_sns_topic.useless_box_notifications.arn
    ]
  }
}

resource "aws_iam_role_policy" "useless_box" {
  name          = "useless-box-policy"
  description   = "Least-privilege policy for the useless-box app"
  policy        = data.aws_iam_policy_document.useless_box.json
}

resource "aws_iam_role_policy_attachment" "useless_box" {
  role        = aws_iam_role.useless_box_instance_role.name 
  policy_arn  = aws_iam_policy.useless_box.arn
}
