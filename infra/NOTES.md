## 2025-10-25

Current problem: provisioning a Linux instance on AWS that I can SSH into, and run the Bun runtime.

`ping: ami-0244ef75e95122fd9@ec2-18-180-150-130.ap-northeast-1.compute.amazonaws.com: Name or service not known`

The service's public IP address is unknown, so in the `aws_instance` I added the argument `associate_public_ip_address`, and after running `tofu apply`,
the error persisted. 

Yesterday, I ran a command to check that this ec2 instance's `id` and `KeyName` corresponded, and the table returned `NONE` in the `keyName` column. That led me
to add an `aws_key_pair` resource, but when I ran `tofu apply`, the program warned that

```
importing EC2 Key Pair (greg-rabbit-key): operation error EC2: ImportKeyPair, ... api error InvalidKeyPair.Duplicate: The keypair already exists
```
So I am working this issue this evening. Listening to Weyes Blood's album ["And in the Darkness, Hearts Aglow"](https://weyesblood.bandcamp.com/album/and-in-the-darkness-hearts-aglow).

Thinking about this message, `Name or service not known` refers to an unknown IP address, which I think might come because of a missing `aws_vpc` resource.

## 2025-10-26
Evening time, created an `aws_subnet` resourced called `rabbit-vpc-public`, which I thought would add a gateway to assist in discovering the network. 

This very old [stackoverflow post](https://stackoverflow.com/questions/2813843/possible-reasons-for-timeout-when-trying-to-access-ec2-instance#15004658) pointed me in the correct direction to ensure that I had a vpc, internet gateway, routing table, and associations created.

## 2025-10-27
On my commute home, I started to read the paper "A Rational Design Process: How and Why to Fake It" by David L. Parnas and Paul C. Clements. So far, the idea about separation of concerns seems to resonate that designing "software is one in which we attempt to separate concerns so that we are working with a manageable amount of information." It resonates with other repostories that I have read while attempting to fix the `kex_exchange_identification: read: Connection reset by peer` issue; Modules seems to be separated by `version.tf`, `variables.tf`, `main.tf`, etc.