/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const MultiCheckAudit = require('./multi-check-audit');

class ManifestShortNameLength extends MultiCheckAudit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      name: 'manifest-short-name-length',
      description: 'The `short_name` won\'t be truncated on the homescreen',
      failureDescription: 'The `short_name` will be truncated on the homescreen',
      helpText: 'Make your app\'s `short_name` fewer than 12 characters to ' +
          'ensure that it\'s not truncated on homescreens. [Learn ' +
          'more](https://developers.google.com/web/tools/lighthouse/audits/manifest-short_name-is-not-truncated).',
      requiredArtifacts: ['Manifest'],
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit_(artifacts) {
    const failures = [];
    const warnings = [];

    return artifacts.requestManifestValues(artifacts.Manifest).then(manifestValues => {
      const result = {warnings, failures, manifestValues};

      if (manifestValues.isParseFailure) {
        failures.push(manifestValues.parseFailureReason);
        return result;
      }

      const shortNameCheckIds = ['hasShortName', 'shortNameLength'];
      manifestValues.allChecks.filter(item => shortNameCheckIds.includes(item.id)).forEach(item => {
        if (!item.passing) failures.push(item.failureText);
      });

      return result;
    });
  }
}

module.exports = ManifestShortNameLength;
