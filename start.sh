#!/bin/sh

source /etc/environment

docker run --rm --name link-analytics-results-api.service -p 3000:3000 -p 3007:3007 -e COREOS_PRIVATE_IPV4=${COREOS_PRIVATE_IPV4} zetta/zetta-analytics-results-api
