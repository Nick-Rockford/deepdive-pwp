$(document).ready(function(){
  $('#form').validate({
    debug: true,
    errorClass: 'alert alert-danger',
    ErrorLabelContainer: '#output-area',
    errorElement: 'div',
    // rules to define good and bad inputs
    // each rule start with the form input element's NAME attribute
    rules: {
      formName: {
        required: true
      },
      formEmail: {
        email: true,
        required: true
      },
      formMessage:{
        required: true,
        maxlength: 2000
      }
    },
    messages: {
      formName: {
        required: 'Name is required'
      },
      formEmail: {
        email: 'Please provide a valid email',
        required: 'Email is required'
      },
      formMessage: {
        required: 'a message is required',
        maxlength: 'Message must be less than 2000 characters'
      }
    },
    submitHandler: (form) =>{
      $('#form').ajaxSubmit({
        type: 'POST',
        url: $('form').attr('action'),
        success: (ajaxOutput) => {
          $('#output-area').css('display','')
          $('#output-area').html(ajaxOutput)

          if ($('.alert-success') >= 1){
            $('#form')[0].reset()
          }
        }
      })
    }
  })
})