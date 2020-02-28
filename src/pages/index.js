import React, { useState, useEffect } from "react"

import { useStaticQuery, graphql } from "gatsby"
import moment from "moment"

import {countries, continents} from "countries-list"
import { getCode } from "country-list"


import { useQueryParam, StringParam } from 'use-query-params'


import Layout from "../components/layout"
import SEO from "../components/seo"

const headerStyle = {
  paddingBottom: "0.3em", 
  borderBottom: "1px solid"
}

const getQueryFromLocation = () => {
  if(typeof window !== 'undefined' && window) {
    return "" // useQueryParam will parse query params automatically
  } else {
    return "?dummy-param"
  }
}

const SummerSchoolRow = ({data}) => {
  return <div style={{marginTop: "1.5em", marginBottom: "2em"}}>
    <h4 style={{padding: 0, margin: "5px 0"}}>
      <a style={{color: "black"}} href={data.link}>
        {data.name} {data.countryData.emoji}
      </a>
    </h4>
    <div>
      <span>
        <b>Dates: </b>{data.date_start} - {data.date_end}
      </span>
      <span style={{marginLeft: "2em"}}>
        <b>Location:</b> {data.location}, {data.country}
      </span>
    </div>
    <div>
      <b>{ data.isAvailable? "Application deadline" : "Previous application deadline" }:</b> {data.deadline}
    </div>
    { data.notes &&
      <i>Note: {data.note}</i>
    }
  </div>
}

const IndexPage = () => {
  const [queryRegion, setQueryRegion] = useQueryParam(
    "region",
    StringParam,
    getQueryFromLocation()
  )

  const [region, setRegion] = useState()

  const setTypeValue = (v) => {
    setQueryRegion(v)
    setRegion(v)
  }

  useEffect(() => {
    setRegion(queryRegion || "all")
  }, [])

  const today = moment()
  const db = useStaticQuery(graphql`
    query {
        allSummerSchoolsCsv {
          edges {
            node {
              name
              location
              country
              date_start
              date_end
              cost
              deadline
              link
              note
            }
          }
        }
      }
    `
  )



  const summerSchools = db.allSummerSchoolsCsv.edges.map( s => {
      const deadline = moment(s.node.deadline, "DD/MM/YYYY")
      return {
        ...s.node,
        deadlineMoment: deadline,
        isAvailable: deadline > today,
        countryData: countries[getCode(s.node.country) || s.node.country]
      }
  })


  const validRegions = Array.from(
    new Set(summerSchools.map(s => s.countryData.continent))
  )

  validRegions.sort()

  const selectedScholarships = summerSchools
    .filter(s => s.countryData.continent === region || region === "all")

  const availableScholarships = selectedScholarships.filter(s => s.isAvailable)
  availableScholarships.sort( (a, b) => a.deadlineMoment - b.deadlineMoment)

  const notAvailableScholarships = selectedScholarships.filter(s => !s.isAvailable)

  notAvailableScholarships.sort((aa, bb) => {
    const a = aa.name
    const b = bb.name

    if( a < b ) { return -1 }
    else if (a > b) { return 1 }
    else { return 0 }
  } )


  return <Layout>
    <SEO title="Home"/>
    <div style={{ marginBottom: "3em" }}>
      <b>Region {` `}
      <select value={region} onChange={(e) => setTypeValue(e.target.value)}>
        <option key="all" value="all">all</option>
        {
          validRegions.map(t => {
            return <option key={t} value={t}>{continents[t]}</option>
          })
        }
      </select>
      </b>
      <br/>
    </div>
    <div>
      <h3 style={headerStyle}>Application Portal Openning ({availableScholarships.length} schools)</h3>
      <div>
        { 
          availableScholarships.map(r => <SummerSchoolRow key={r.name} data={r}/>)
        }
      </div>
      <h3 style={headerStyle}>Previous Summer Schools ({notAvailableScholarships.length} schools) </h3>
      <div>
        { 
          notAvailableScholarships.map(r => <SummerSchoolRow key={r.name} data={r}/>)
        }
      </div>
    </div>
    <hr />
  </Layout>
}

export default IndexPage
