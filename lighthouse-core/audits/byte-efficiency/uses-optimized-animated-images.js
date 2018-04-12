/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
/*
 * @fileoverview Audit a page to ensure that videos are used instead of animated gifs
 */
'use strict';

const WebInspector = require('../../lib/web-inspector');
const ByteEfficiencyAudit = require('./byte-efficiency-audit');

// the threshold for the size of GIFs wich we flag as unoptimized
const GIF_BYTE_THRESHOLD = 100 * 1024;

class UsesOptimizedAnimatedImages extends ByteEfficiencyAudit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      name: 'uses-optimized-animated-images',
      scoreDisplayMode: ByteEfficiencyAudit.SCORING_MODES.NUMERIC,
      description: 'Use a video formats for animated content',
      helpText: 'Large GIFs are inefficient for delivering animated content. Consider using ' +
        'MPEG4/WebM videos for animations and PNG/WebP for static images instead of GIF to save ' +
        'network bytes. [Learn more](https://en.wikipedia.org/wiki/Video_alternative_to_GIF)',
      requiredArtifacts: ['devtoolsLogs'],
    };
  }

  /**
   * Calculate savings percentage
   * @param {number} bytes
   * @see https://github.com/GoogleChrome/lighthouse/issues/4696#issuecomment-380296510} bytes
   */
  static getPercentSavings(bytes) {
    return (29.1 * Math.log10(bytes) - 100.7) / 100;
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static async audit_(artifacts) {
    const devtoolsLogs = artifacts.devtoolsLogs[UsesOptimizedAnimatedImages.DEFAULT_PASS];

    const networkRecords = await artifacts.requestNetworkRecords(devtoolsLogs);
    const unoptimizedContent = networkRecords.filter(
      record => record.mimeType === 'image/gif' &&
        record._resourceType === WebInspector.resourceTypes.Image &&
        record.resourceSize > GIF_BYTE_THRESHOLD
    );

    const results = unoptimizedContent.map(record => {
      return {
        url: record.url,
        totalBytes: record.resourceSize,
        wastedBytes: record.resourceSize * UsesOptimizedAnimatedImages.getPercentSavings(record.resourceSize),
      };
    });

    const headings = [
      {key: 'url', itemType: 'url', text: 'URL'},
      {
        key: 'totalBytes',
        itemType: 'bytes',
        displayUnit: 'kb',
        granularity: 1,
        text: 'Transfer Size',
      },
      {key: 'wastedBytes', itemType: 'bytes', displayUnit: 'kb', granularity: 1, text: 'Byte Savings'},
    ];

    return {
      results,
      headings,
    };
  }
}

module.exports = UsesOptimizedAnimatedImages;
