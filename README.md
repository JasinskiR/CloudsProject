# CloudsProject
### Cognito
There is a lambda connected to cognito at post registration which add user to RDS DB
### Bastion
To secure communication with RDS DB (which we want to secure from the world) it is nice to use a some point of fire wall (gate) via additional EC2 instance called Bastion\
Bastion host should be in the same Availability Zone as RDS.\
RDS shoul has security group that allows communication through that bastion EC2 at designated port (5432)
### Lambda
Nice to know:\
Lambda should has security group that allows communication inboud (can be all traffic) and outbound to RDS port (which is 5432 in this case)\
To be able to connect to RDS based on postgres there is a necessity to add lambda layer for psycopg2-binary. The architecture version at which the library has been build should be the same as the architecture of lambda (the same with python version used to build/download lib)\
At this case it were x86_64 and python3.12
https://repost.aws/knowledge-center/lambda-import-module-error-python