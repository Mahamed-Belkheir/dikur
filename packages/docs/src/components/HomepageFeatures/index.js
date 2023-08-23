import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Abstract',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Dikur abstracts your application's interface,
        reducing the coupling between the implementation and
        your interface's contracts
      </>
    ),
  },
  {
    title: 'Small code bundle',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Dikur implements the minimum abstraction,
        and trades complete decoupling with minimal code,
        We believe that code that is likely to completely changed
        should not be abstracted anyway, and be left coupled.
      </>
    ),
  },
  {
    title: 'Common base',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Tooling built for Dikur works across multiple implementation libraries
        (e.g. OpenAPI generator works for APIs on express, Hono etc), helping 
        reduce repeated workloads
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
