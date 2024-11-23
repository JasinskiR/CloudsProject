# CloudsProject
### Cognito
There is a lambda connected to cognito at post registration which add user to RDS DB
### Bastion
To secure communication with RDS DB (which we want to secure from the world) it is nice to use a some point of fire wall (gate) via additional EC2 instance called Bastion\
Bastion host should be in the same Availability Zone as RDS.\
RDS should has security group that allows communication through that bastion EC2 at designated port (5432)
### Lambda
Nice to know:\
Lambda should has security group that allows communication inboud (can be all traffic) and outbound to RDS port (which is 5432 in this case)\
To be able to connect to RDS based on postgres there is a necessity to add lambda layer for psycopg2-binary. The architecture version at which the library has been build should be the same as the architecture of lambda (the same with python version used to build/download lib)\
At this case it were x86_64 and python3.12
https://repost.aws/knowledge-center/lambda-import-module-error-python

### Docker
Example code how to build and push docker image to ECR
``` bash
docker buildx build --platform linux/amd64 -t 814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:frontend_tf_v2 .

docker push 814842473829.dkr.ecr.us-east-1.amazonaws.com/clouds_project:frontend_tf_v2  
```
<mark>IMPORTANT</mark>\
At one ECR repository should be only one kind of image. Tags are not supposed to defference them between backend and frontend images :joy:\
But due to lack of time it is mixed right now

## HUGE TROUBLE MAKER
Oh . . .\
So, long story short\
React inject environments while being build so such a backend url which is known after running `terraform apply` can not be inject at that process - static form of application is being used to run. So there has to be other solution to do so.\
And there is, dynamic injection after running docker image - a lot of testing and digging into the code and docker image. Trying to replace occurance with `sed | perl` and `nginx.conf` to inject script into `index.html` after that.\
https://pamalsahan.medium.com/dockerizing-a-react-application-injecting-environment-variables-at-build-vs-run-time-d74b6796fe38
https://medium.com/@rivaifnasution/tutorial-how-to-use-dotenv-in-react-for-beginners-ac79d9b6ddbf

### Future plans
https://medium.com/@ayushunleashed/how-to-build-ecs-ec2-auto-scaling-infrastructure-on-aws-ba730aa076a9