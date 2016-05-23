#!/bin/sh

docker rm link-analytics-results-api.service
docker rmi zetta/zetta-analytics-results-api

docker build -t zetta/zetta-analytics-results-api .

