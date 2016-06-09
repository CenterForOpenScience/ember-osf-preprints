#!/usr/bin/env python2.7

# file to scrape the taxonomy off of PLOS
# requires requests, lxml, and bs4

import requests
import urllib
from bs4 import BeautifulSoup as bs
import json

base_url = 'http://journals.plos.org/plosone/browse'

def scrape(url, current_depth):
    r = urllib.urlopen(url).read()
    soup = bs(r)
    div = soup.find_all('div', class_='cf subject-listing')
    inner_div = div[0].find_all('div', class_='dropdown')
    links = inner_div[0].find_all('a')
    for i in xrange(current_depth):
        links = links[1:]
    #links = links[1:]
    subject_list = []
    link_list = []
    for link in links:
        components = str(link).split('"')
        underscore = components[1]
        underscore = underscore.split('/')
        underscore = underscore[-1]
        space = components[2]
        space = space[1:-4]
        if underscore and space:
            subject_list.append(space)
            link_list.append(underscore)
    return subject_list, link_list

def get_taxonomy(url, subject, current_depth):
    if current_depth == 3:
        return scrape(base_url + '/' + url, current_depth)[0]
    current_tax = {subject: []}
    subject_list, link_list = scrape(base_url + '/' + url, current_depth)
    current_tax[subject] = subject_list
    current_tax[subject] = [{subject_list[i]: get_taxonomy(link_list[i], subject_list[i], current_depth + 1)} for i in range(len(subject_list))]
    return current_tax

if __name__ == '__main__':

    tax_depth = 0
    tax = get_taxonomy('', 'base', tax_depth)
    print json.dumps(tax, indent=2)
