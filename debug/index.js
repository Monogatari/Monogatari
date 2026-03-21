import './vendor/prism.js';


// This global object signals to FancyError that we're in debug mode and
// fancy errors should be displayed. Without this, FancyError.show() will
// not display any errors.
if (typeof window === 'object') {
  window.MonogatariDebug = {
    enabled: true,
    version: '1.0.0'
  };
}

/**
 * Register all error templates with the FancyError class.
 * This is called after the Monogatari engine is loaded to ensure we use
 * the same FancyError instance that the engine uses.
 * @param FancyError
 */
function registerErrors(FancyError) {
  // Canvas Action
  FancyError.register('action:canvas:invalid_mode', {
    title: 'The canvas mode provided ("{{mode}}") is not valid.',
    message: 'Monogatari attempted to show a canvas object but the mode "{{mode}}" was not found in the canvas action configuration as a valid mode.',
    props: {
      'Mode Provided': '{{mode}}',
      'You may have meant one of these': '{{validModes}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check your statement and make sure there are no typos on the mode you provided.'
      }
    }
  });

  FancyError.register('action:canvas:object_not_found', {
    title: 'The canvas object "{{name}}" was not found or is invalid',
    message: 'Monogatari attempted to retrieve an object named "{{name}}" but it didn\'t exist in the canvas objects.',
    props: {
      'Canvas': '{{name}}',
      'You may have meant': '{{availableObjects}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check the object\'s name is correct and that you have defined it previously. A canvas object is defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
              this.engine.action ('Canvas').objects ({
                stars: {
                  start: () => {},
                  stop: () => {},
                  restart: () => {},
                  layers: [],
                  state: {},
                  props: {}
                }
              });
            </code>
          </pre>
        `,
        '_2': 'Notice the object defined uses a name or an id, in this case it was set to "stars" and to show it, you must use that exact name:',
        '_3': `
          <pre><code class='language-javascript'>"show canvas stars background"</code></pre>
        `
      }
    }
  });

  // Dialog Action
  FancyError.register('action:dialog:textbox_hidden', {
    title: 'A dialog is being shown while the textbox is hidden',
    message: 'Monogatari attempted to display a dialog but the textbox is currently hidden. The dialog will still be shown, but the player may not be able to see it.',
    props: {
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'If you intentionally hid the textbox, make sure to show it again before displaying dialog:',
        '_1': `
          <pre><code class='language-javascript'>"show textbox"</code></pre>
        `,
        '_2': 'If you want to show visual elements without dialog while the textbox is hidden, use non-dialog actions like show image or show character.'
      }
    }
  });

  // Message Action
  FancyError.register('action:message:not_found', {
    title: 'The message "{{id}}" was not found',
    message: 'Monogatari attempted to retrieve a message named "{{id}}" but it didn\'t exist in the messages object.',
    props: {
      'Message': '{{id}}',
      'You may have meant': '{{availableMessages}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check the message name is correct and that you have defined it previously. A Message is defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
              this.engine.action ('message').mesages ({
                'Welcome': {
                  title: 'Welcome!',
                  subtitle: 'This is the Monogatari VN Engine',
                  body: 'This is where the magic gets done!'
                }
              });
            </code>
          </pre>
        `,
        '_2': 'Notice the message defined uses a name or an id, in this case it was set to "Welcome" and to show it, you must use that exact name:',
        '_3': `
          <pre><code class='language-javascript'>"show message Welcome"</code></pre>
        `
      }
    }
  });

  // HideCharacterLayer Action
  FancyError.register('action:hide_character_layer:character_not_found', {
    title: 'The character "{{asset}}" does not exist',
    message: 'Monogatari attempted to get information about the character "{{asset}}" but it wasn\'t found on the characters object.',
    props: {
      'Missing Character': '{{asset}}',
      'You may have meant one of these': '{{availableCharacters}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check your characters object and your script to make sure the character exists and that it does not have a typo in it.'
      }
    }
  });

  FancyError.register('action:hide_character_layer:layer_not_shown', {
    title: 'The character layer "{{layer}}" can\'t hide because it\'s not being shown',
    message: 'Monogatari attempted to hide the layer "{{layer}}" of the character "{{asset}}" but it was not being shown.',
    props: {
      'Missing Layer': '{{layer}}',
      'Character': '{{asset}}',
      'You may have meant one of these': '{{availableCharacters}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check that before this hide action you have a show action that shows the character you want to hide.'
      }
    }
  });

  // HideCharacter Action
  FancyError.register('action:hide_character:character_not_found', {
    title: 'The character "{{asset}}" does not exist',
    message: 'Monogatari attempted to get information about the character "{{asset}}" but it wasn\'t found on the characters object.',
    props: {
      'Missing Character': '{{asset}}',
      'You may have meant one of these': '{{availableCharacters}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check your characters object and your script to make sure the character exists and that it does not have a typo in it.'
      }
    }
  });

  FancyError.register('action:hide_character:not_shown', {
    title: 'The character "{{asset}}" can\'t hide because it\'s not being shown',
    message: 'Monogatari attempted to hide the character "{{asset}}" but it was not being shown.',
    props: {
      'Missing Character': '{{asset}}',
      'You may have meant one of these': '{{availableCharacters}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check that before this hide action you have a show action that shows the character you want to hide.'
      }
    }
  });

  // Conditional Action
  FancyError.register('action:conditional:negative_value', {
    title: 'Conditional condition returned a negative number "{{value}}".',
    message: 'The `Condition` function returned "{{value}}" and only positive numbers are allowed for numeric values.',
    props: {
      'Problematic Value': '{{value}}',
      'You may have meant one of these': '{{availableBranches}}'
    }
  });

  FancyError.register('action:conditional:non_integer_value', {
    title: 'Conditional condition returned a non-integer value "{{value}}".',
    message: 'The `Condition` function returned "{{value}}" and only integer numbers are allowed for numeric values.',
    props: {
      'Problematic Value': '{{value}}',
      'You may have meant one of these': '{{availableBranches}}'
    }
  });

  FancyError.register('action:conditional:branch_not_found', {
    title: 'Conditional attempted to execute a non existent branch "{{branch}}"',
    message: 'The `Condition` function returned "{{branch}}" as the branch to execute but it does not exist.',
    props: {
      'Problematic Branch': '{{branch}}',
      'You may have meant one of these': '{{availableBranches}}'
    }
  });

  // Notification Action
  FancyError.register('action:notification:invalid_time', {
    title: 'The specified time was not an integer',
    message: 'Monogatari attempted to transform the given time into an integer value but failed.',
    props: {
      'Specified time': '{{time}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
        '_1': 'For example, the following statement would make a notification go away after 5 seconds:',
        '_3': `
          <pre><code class='language-javascript'>"show notification Welcome 5000"</code></pre>
        `
      }
    }
  });

  FancyError.register('action:notification:not_found', {
    title: 'The notification "{{name}}" was not found',
    message: 'Monogatari attempted to retrieve a notification named "{{name}}" but it didn\'t exist in the notifications object.',
    props: {
      'Notification': '{{name}}',
      'You may have meant': '{{availableNotifications}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check the notification\'s name is correct and that you have defined it previously. A Notification is defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
              this.engine.action ('Notification').notifications ({
                'Welcome': {
                  title: 'Welcome!',
                  body: 'This is the Monogatari VN Engine',
                  icon: ''
                }
              });
            </code>
          </pre>
        `,
        '_2': 'Notice the notification defined uses a name or an id, in this case it was set to "Welcome" and to show it, you must use that exact name:',
        '_3': `
          <pre><code class='language-javascript'>"show notification Welcome"</code></pre>
        `
      }
    }
  });

  // Function Action
  FancyError.register('action:function:apply_error', {
    title: 'An error occurred while trying to revert a Reversible Function.',
    message: 'Monogatari attempted to run the `Apply` method of a Reversible Function but an error occurred.',
    props: {
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check the code for your function, there may be additional information in the console.',
      }
    }
  });

  FancyError.register('action:function:revert_error', {
    title: 'An error occurred while trying to revert a Reversible Function.',
    message: 'Monogatari attempted to run the `Revert` method of a Reversible Function but an error occurred.',
    props: {
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check the code for your function, there may be additional information in the console.',
      }
    }
  });

  // Video Action
  FancyError.register('action:video:invalid_mode', {
    title: 'The video mode provided ("{{mode}}") is not valid.',
    message: 'Monogatari attempted to play a video but the mode "{{mode}}" was not found in the video action configuration as a valid mode.',
    props: {
      'Mode Provided': '{{mode}}',
      'You may have meant one of these': '{{validModes}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check your statement and make sure there are no typos on the mode you provided.'
      }
    }
  });

  // Wait Action
  FancyError.register('action:wait:invalid_time', {
    title: 'The specified time was not an integer',
    message: 'Monogatari attempted to transform the given time into an integer value but failed.',
    props: {
      'Specified time': '{{time}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
        '_1': 'For example, the following statement would make the game wait for 5 seconds:',
        '_3': `
          <pre><code class='language-javascript'>"wait 5000"</code></pre>
        `
      }
    }
  });

  // Vibrate Action
  FancyError.register('action:vibrate:invalid_time', {
    title: 'The specified time was not an integer',
    message: 'Monogatari attempted to transform the given time into an integer value but failed.',
    props: {
      'Specified time': '{{time}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
        '_1': 'For example, the following statement would make the device vibrate for 5 seconds:',
        '_3': `
          <pre><code class='language-javascript'>"vibrate 5000"</code></pre>
        `,
        '_4': 'If you wanted to make the device vibrate on a pattern, this is a correct syntax:',
        '_5': `
          <pre><code class='language-javascript'>"vibrate 5000 100 4000 200 3000"</code></pre>
        `
      }
    }
  });

  // Jump Action
  FancyError.register('action:jump:label_not_found', {
    title: 'The label "{{targetLabel}}" does not exist',
    message: 'Monogatari attempted to jump to the label named "{{targetLabel}}" but it wasn\'t found on the script.',
    props: {
      'Missing Label': '{{targetLabel}}',
      'You may have meant one of these': '{{availableLabels}}',
      'Statement': '{{statement}}',
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'Check if the label in your jump statement is correct and that you have also defined it correctly.'
      }
    }
  });

  // Language Selection Screen
  FancyError.register('component:language_selection_screen:metadata_not_found', {
    title: 'Metadata for language "{{language}}" could not be found.',
    message: 'Monogatari attempted to retrieve the metadata for this language but it does not exists',
    props: {
      'Language Not Found': '{{language}}',
      'You may have meant one of these': '{{availableLanguages}}',
      'Help': {
        '_': 'Please check that you have defined the metadata for this language. Remember the metadata is defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
            monogatari.languageMetadata ("Español", {
              "code": "es",
              "icon": "🇲🇽"
            });
            </code>
          </pre>
        `,
        'Documentation': '<a href="https://developers.monogatari.io/documentation/v/develop/configuration-options/game-configuration/internationalization/" target="_blank">Internationalization</a>'
      }
    }
  });

  // ----------------------------------------------------------------------------
  // Engine Errors
  // ----------------------------------------------------------------------------

  // Translation Errors
  FancyError.register('engine:translation:key_not_found', {
    title: 'Translation for string "{{key}}" could not be found',
    message: 'Monogatari attempted to find a translation for the current language set in the preferences but there was none.',
    props: {
      'String Not Found': '{{key}}',
      'Language': '{{language}}',
      'Found in these elements': '{{elements}}',
      'You may have meant one of these': '{{availableStrings}}',
      'Help': {
        '_': 'Please check that this string has been correctly defined in your translations. A translation is defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
            monogatari.translation ("YourLanguage", {
              "SomeString": "Your Translation"
            });
            </code>
          </pre>
        `,
        '_2': 'You may also want to check if the [data-string] property of the HTML elements above is correct or if they have a typo.',
        'Documentation': '<a href="https://developers.monogatari.io/documentation/v/develop/configuration-options/game-configuration/internationalization/" target="_blank">Internationalization</a>'
      }
    }
  });

  FancyError.register('engine:translation:language_not_found', {
    title: 'Language could not be found',
    message: 'Monogatari attempted to translate the UI using the current language set in the preferences but no translations could be found for it.',
    props: {
      'Problematic Language': '{{language}}',
      'You may have meant one of these': '{{availableLanguages}}',
      'Help': {
        '_': 'Please check if you have defined correctly the translations for this language, translations are defined as follows:',
        '_1': `
          <pre>
            <code class='language-javascript'>
            monogatari.translation ("YourLanguage", {
              "SomeString": "Your Translation"
            });
            </code>
          </pre>
        `,
        '_2': 'You may also want to check if the value of your language selector is right:',
        '_3': '{{languageSelectorValue}}',
        'Documentation': '<a href="https://developers.monogatari.io/documentation/v/develop/configuration-options/game-configuration/internationalization/" target="_blank">Internationalization</a>'
      }
    }
  });

  // Component Registration Errors
  FancyError.register('engine:component:already_registered', {
    title: 'Unable to register component "{{tag}}"',
    message: 'Monogatari attempted to register a component but another component had already been registered for the same tag.',
    props: {
      'Component / Tag': '{{component}}',
      'Help': {
        '_': 'Once a component for a tag has been registered and the setup has completed, it can not be replaced or removed. Try removing the conflicting component first:',
        '_1': '{{unregisterCode}}',
      }
    }
  });

  FancyError.register('engine:component:unregister_after_setup', {
    title: 'Unable to unregister component "{{component}}"',
    message: 'Monogatari attempted to unregister a component but the setup had already happened.',
    props: {
      'Component': '{{component}}',
      'Help': {
        '_': 'Components can only be unregistered before the setup step is completed.',
        '_1': 'Try performing this action before the <code class="language-javascript">monogatari.init ()</code> function is called.'
      }
    }
  });

  // Script Errors
  FancyError.register('engine:script:language_not_found', {
    title: 'Script Language "{{language}}" Was Not Found',
    message: 'Monogatari attempted to retrieve the script for this language but it does not exists',
    props: {
      'Language Not Found': '{{language}}',
      'MultiLanguage Setting': '{{multiLanguageSetting}}',
      'You may have meant one of these': '{{availableLanguages}}',
      'Help': {
        '_': 'If your game is not a multilanguage game, change the setting on your options.js file',
        '_1': `
          <pre>
            <code class='language-javascript'>
            "MultiLanguage": false,
            </code>
          </pre>
        `,
        '_2': 'If your game is a multilanguage game, please check that the language label is correctly written on your script. Remember a multilanguage script looks like this:',
        '_3': `
          <pre>
            <code class='language-javascript'>
            monogatari.script ({
              'English': {
                'Start': [
                  'Hi, welcome to your first Visual Novel with Monogatari.'
                ]
              },
              'Español': {
                'Start': [
                  'Hola, bienvenido a tu primer Novela Visual con Monogatari'
                ]
              }
            });
            </code>
          </pre>
        `
      }
    }
  });

  FancyError.register('engine:script:label_not_found', {
    title: '"{{startLabel}}" Label was not found',
    message: 'Monogatari tried to get your start label but it couldn\'t find it in your script.',
    props: {
      'Start Label on your Settings': '{{startLabel}}',
      'Labels Available': '{{availableLabels}}',
      'Help': {
        '_': 'Please check that the label exists in your script.'
      }
    }
  });

  // Storage Errors
  FancyError.register('engine:storage:variable_not_found', {
    title: 'Variable "{{variable}}" does not exists in your storage',
    message: 'Monogatari attempted to interpolate a variable from your storage but it doesn\'t exists.',
    props: {
      'Script Statement': '{{statement}}',
      'Part Not Found': '{{partNotFound}}',
      'Variables Available in Storage': '{{availableVariables}}',
      'Help': {
        '_': 'Please check your storage object and make sure the variable you are using exists.',
        '_1': 'You should also make sure that there is no typo in your script and that the variable names in your script and storage match.',
        'Documentation': '<a href="https://developers.monogatari.io/documentation/v/develop/building-blocks/data-storage/" target="_blank">Storage</a>'
      }
    }
  });

  // Runtime Errors
  FancyError.register('engine:run:function_error', {
    title: 'An error occurred while trying to run a Function.',
    message: 'Monogatari attempted to run a function on the script but an error occurred.',
    props: {
      'Label': '{{label}}',
      'Step': '{{step}}',
      'Help': {
        '_': 'More details should be available at the console.',
      }
    }
  });

  // Lifecycle Errors
  FancyError.register('engine:lifecycle:should_proceed_error', {
    title: 'An error ocurred while trying to execute a shouldProceed function.',
    message: 'Monogatari attempted to execute the function but an error ocurred.',
    props: {
      'Error Message': '{{errorMessage}}',
      'Help': {
        '_': 'More details should be available at the console.',
      }
    }
  });

  FancyError.register('engine:lifecycle:will_proceed_error', {
    title: 'An error ocurred while trying to execute a willProceed function.',
    message: 'Monogatari attempted to execute the function but an error ocurred.',
    props: {
      'Error Message': '{{errorMessage}}',
      'Help': {
        '_': 'More details should be available at the console.',
      }
    }
  });

  FancyError.register('engine:lifecycle:should_rollback_error', {
    title: 'An error ocurred while trying to execute a shouldRollback function.',
    message: 'Monogatari attempted to execute the function but an error ocurred.',
    props: {
      'Error Message': '{{errorMessage}}',
      'Help': {
        '_': 'More details should be available at the console.',
      }
    }
  });

  FancyError.register('engine:lifecycle:will_rollback_error', {
    title: 'An error ocurred while trying to execute a willRollback function.',
    message: 'Monogatari attempted to execute the function but an error ocurred.',
    props: {
      'Error Message': '{{errorMessage}}',
      'Help': {
        '_': 'More details should be available at the console.',
      }
    }
  });

  // Music Errors
  FancyError.register('engine:music:not_defined', {
    title: 'The music "{{music}}" is not defined.',
    message: 'Monogatari attempted to find a definition of a music asset but there was none.',
    props: {
      'Music Not Found': '{{music}}',
      'You may have meant one of these': '{{availableMusic}}',
      'Help': {
        '_': 'Please check that you have correctly defined this music asset and wrote its name correctly in the `MainScreenMusic` variable',
        '_1': `
          <pre>
            <code class='language-javascript'>
            'MainScreenMusic': 'TheKeyToYourMusicAsset'
            </code>
          </pre>
        `,
      }
    }
  });

  // Element Errors
  FancyError.register('engine:element:not_ready', {
    title: 'Main element is not ready yet',
    message: 'Monogatari attempted to execute a function when the main element was not fully loaded yet.',
    props: {
      'Trace': 'You should be able to see an error with the order in which functions were executed in your browser\'s console (Ctrl + Shift + i). The last one should be part of your code and that\'s the one that needs to be changed.',
      'Help': {
        '_': 'Please wrap or move your code into a $_ready () function block to wait for the page to be fully loaded before executing it.',
        '_1': `
          <pre>
            <code class='language-javascript'>
            monogatari.ready ('#monogatari', () => {
              // Your code should go here
            });
            </code>
          </pre>
        `
      }
    }
  });

  // Component Lifecycle Errors
  FancyError.register('engine:component:lifecycle_error', {
    title: 'Error in component <{{tag}}> during {{lifecycle}}',
    message: 'An error occurred while executing the {{lifecycle}} lifecycle method.',
    props: {
      'Component': '{{tag}}',
      'Lifecycle Method': '{{lifecycle}}',
      'Error Message': '{{errorMessage}}',
      'Stack Trace': '{{stackTrace}}',
      'Help': {
        '_': 'Check the console for more details about this error.',
        '_1': 'Make sure all async operations in lifecycle methods are properly handled.'
      }
    }
  });
}

// Wait for Monogatari to be available, then register all errors with its
// FancyError instance. This ensures we use the same instance the engine uses.
if (typeof window === 'object') {
  // Poll for Monogatari to be available (it loads after this script)
  const waitForMonogatari = () => {
    if (window.Monogatari && window.Monogatari.FancyError) {
      registerErrors(window.Monogatari.FancyError);
    } else {
      // Check again on next frame
      requestAnimationFrame(waitForMonogatari);
    }
  };

  // Start checking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMonogatari);
  } else {
    waitForMonogatari();
  }
}

if (typeof window === 'object') {
  window.addEventListener('error', (event) => {
    const { message, lineno, filename } = event;

    // Once the DOM is ready, a Fancy Error will be shown providing more information
    window.addEventListener('DOMContentLoaded', () => {
      // Use Monogatari's FancyError if available
      const FancyError = window.Monogatari?.FancyError;
      if (FancyError) {
        FancyError.show (
          'An Unknown Error Occurred',
          message,
          {
            'File': filename,
            'Line': lineno,
            'Help': {
              '_': 'This is most likely a scripting error, please check your script and JavaScript code for missing commas or incorrect syntax.',
              '_1': 'There may be additional information on your browser\'s console. You can open your console by pressing Ctrl + Shift + I'
            }
          }
        );
      }
    });
  });
}
